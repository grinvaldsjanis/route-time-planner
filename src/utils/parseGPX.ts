import calculateCurveRadius from "./calculateCurvature";
import calculateSlope from "./calculateSlope";
import { preprocessTrackPoints } from "./preprocessNewPoints";
import { fetchElevationData } from "../utils/fetchElevationData";
import calculateTrackParts from "./calculateTrackParts";
import {
  GPXData,
  Track,
  TrackPoint,
  ReferenceWaypoint,
  TrackPart,
} from "./types";
import haversineDistance from "./haversineDistance";
import travelModes from "../constants/travelModes";

export default async function parseGPX(
  gpxContent: string,
  modeKey: keyof typeof travelModes
): Promise<GPXData> {
  const maxProximityDistance = 1000; // Maximum distance in meters (1 km)
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Error parsing XML");
  }

  const gpxName =
    xmlDoc.getElementsByTagName("metadata")[0]?.getElementsByTagName("name")[0]
      ?.textContent || null;

  let waypoints = xmlDoc.getElementsByTagName("wpt");
  const routePoints = xmlDoc.getElementsByTagName("rtept");

  if (waypoints.length === 0 && routePoints.length > 0) {
    waypoints = routePoints;
  }

  const gpxNamespaceURI =
    xmlDoc.documentElement.namespaceURI || "http://www.topografix.com/GPX/1/1";

  const tracks = xmlDoc.getElementsByTagNameNS(gpxNamespaceURI, "trk");

  if (tracks.length === 0) {
    throw new Error("No tracks found in the GPX file.");
  }

  const referenceWaypoints: ReferenceWaypoint[] = [];
  const parsedTracks: Track[] = [];
  const pointsWithoutElevation: { lat: number; lon: number }[] = [];

  // Parse reference waypoints
  for (let i = 0; i < waypoints.length; i++) {
    const wpt = waypoints[i];
    const referenceWpt = parseReferenceWaypoint(wpt);
    if (referenceWpt) {
      referenceWaypoints.push(referenceWpt);
    }
  }

  // Parse tracks
  for (let i = 0; i < tracks.length; i++) {
    const trk = tracks[i];
    const name =
      trk.getElementsByTagNameNS(gpxNamespaceURI, "name")[0]?.textContent ||
      null;

    const trksegs = trk.getElementsByTagNameNS(gpxNamespaceURI, "trkseg");

    const points: TrackPoint[] = [];
    const trackParts: TrackPart[] = [];

    for (let j = 0; j < trksegs.length; j++) {
      const seg = trksegs[j];
      const trkpts = seg.getElementsByTagNameNS(gpxNamespaceURI, "trkpt");

      for (let k = 0; k < trkpts.length; k++) {
        const pt = parseTrackPoint(trkpts[k]);
        if (pt) {
          points.push(pt);
          if (pt.ele === null) {
            pointsWithoutElevation.push({
              lat: parseFloat(pt.lat),
              lon: parseFloat(pt.lon),
            });
          }
        }
      }
    }

    parsedTracks.push({
      name,
      points,
      waypoints: [],
      parts: trackParts,
    });
  }

  // If there are no reference waypoints, create artificial start and destination waypoints
  if (referenceWaypoints.length === 0 && parsedTracks.length > 0) {
    parsedTracks.forEach((track) => {
      if (track.points.length > 0) {
        const startPoint = track.points[0];
        const startWaypoint: ReferenceWaypoint = {
          id: "start",
          lat: startPoint.lat,
          lon: startPoint.lon,
          name: "Start",
          desc: null,
          sym: null,
          type: "start",
        };

        // Create destination waypoint
        const destinationPoint = track.points[track.points.length - 1];
        const destinationWaypoint: ReferenceWaypoint = {
          id: "destination",
          lat: destinationPoint.lat,
          lon: destinationPoint.lon,
          name: "Destination",
          desc: null,
          sym: null,
          type: "destination",
        };

        // Add to reference waypoints
        referenceWaypoints.push(startWaypoint, destinationWaypoint);
      }
    });
  }

  // Match reference waypoints to the closest track points and create track waypoints
  referenceWaypoints.forEach((refWaypoint) => {
    let closestTrackIndex = -1;
    let minDistance = Infinity;
    let closestTrackPointIndex = -1;

    parsedTracks.forEach((track, trackIndex) => {
      track.points.forEach((point, pointIndex) => {
        const distance = haversineDistance(
          parseFloat(refWaypoint.lat),
          parseFloat(refWaypoint.lon),
          parseFloat(point.lat),
          parseFloat(point.lon)
        );

        if (distance < minDistance && distance <= maxProximityDistance) {
          minDistance = distance;
          closestTrackIndex = trackIndex;
          closestTrackPointIndex = pointIndex;
        }
      });
    });

    // Prevent adding duplicate waypoints to the same point
    if (
      closestTrackIndex !== -1 &&
      !parsedTracks[closestTrackIndex].waypoints.some(
        (wp) => wp.closestTrackPointIndex === closestTrackPointIndex
      )
    ) {
      parsedTracks[closestTrackIndex].waypoints.push({
        referenceId: refWaypoint.id,
        closestTrackPointIndex,
      });
    }
  });

  // Calculate track parts based on waypoints
  // Calculate track parts based on waypoints
  parsedTracks.forEach((track) => {
    track.waypoints.sort(
      (a, b) =>
        (a.closestTrackPointIndex ?? Infinity) -
        (b.closestTrackPointIndex ?? Infinity)
    );

    const trackParts = calculateTrackParts(track.waypoints, track, modeKey);

    track.parts = trackParts;
  });

  // Process elevation data if needed
  if (pointsWithoutElevation.length > 0) {
    const elevations = await fetchElevationData(pointsWithoutElevation);
    let elevationIndex = 0;

    parsedTracks.forEach((track) => {
      track.points.forEach((point) => {
        if (point.ele === null) {
          point.ele = elevations[elevationIndex++];
        }
      });
    });
  }

  // Calculate curve and slope for track points
  parsedTracks.forEach((track) => {
    preprocessTrackPoints([track]);
    for (let k = 0; k < track.points.length; k++) {
      if (k > 0 && k < track.points.length - 1) {
        const prevPt = track.points[k - 1];
        const currentPt = track.points[k];
        const nextPt = track.points[k + 1];
        currentPt.curve = calculateCurveRadius(prevPt, currentPt, nextPt);
      }
    }
  });

  parsedTracks.forEach((track) => {
    for (let k = 1; k < track.points.length; k++) {
      const prevPt = track.points[k - 1];
      const currentPt = track.points[k];

      currentPt.slope = calculateSlope(prevPt, currentPt);
    }
  });

  // Clean up closestTrackPointIndex from waypoints
  parsedTracks.forEach((track) => {
    track.waypoints.forEach((waypoint) => {
      delete waypoint.closestTrackPointIndex;
    });
  });

  return {
    gpxName,
    referenceWaypoints,
    tracks: parsedTracks,
  };
}

function parseReferenceWaypoint(element: Element): ReferenceWaypoint | null {
  const lat = element.getAttribute("lat");
  const lon = element.getAttribute("lon");
  const name = element.getElementsByTagName("name")[0]?.textContent;
  const desc = element.getElementsByTagName("desc")[0]?.textContent;
  const sym = element.getElementsByTagName("sym")[0]?.textContent || null;
  const type = element.getElementsByTagName("type")[0]?.textContent || null;

  if (lat !== null && lon !== null) {
    return { id: `${lat}-${lon}`, lat, lon, name, desc, sym, type };
  }

  console.warn("Skipping point with missing lat or lon");
  return null;
}

function parseTrackPoint(element: Element): TrackPoint | null {
  const lat = element.getAttribute("lat");
  const lon = element.getAttribute("lon");
  const eleText = element.getElementsByTagName("ele")[0]?.textContent;
  const ele =
    eleText !== undefined && eleText !== null ? parseFloat(eleText) : null;

  if (lat !== null && lon !== null) {
    return {
      lat,
      lon,
      ele,
      curve: null,
      slope: null,
    };
  }

  console.warn("Skipping point with missing lat or lon");
  return null;
}
