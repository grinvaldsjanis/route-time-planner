import calculateCurveRadius from "./calculateCurvature";
import calculateSlope from "./calculateSlope";
import calculateTrackParts from "./calculateTrackParts";
import { preprocessTrackSegments } from "./preprocessNewPoints";
import { fetchElevationData } from "../utils/fetchElevationData";
import {
  GPXData,
  Track,
  TrackSegment,
  TrackPoint,
  Waypoint,
  TrackPointRef,
} from "./types";
import isWithinApproximateDistance from "./isWithinApproximateDistance";

export default async function parseGPX(
  gpxContent: string,
  trackIndex: number = 0,
  maxProximityDistance: number = 1
): Promise<GPXData> {
  console.log("Raw GPX Content:", gpxContent);

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    console.error(
      "Error parsing XML:",
      xmlDoc.getElementsByTagName("parsererror")[0]
    );
    throw new Error("Error parsing XML");
  }

  console.log("Parsed XML Document:", xmlDoc);

  const gpxName =
    xmlDoc.getElementsByTagName("metadata")[0]?.getElementsByTagName("name")[0]
      ?.textContent || null;
  console.log("GPX Name:", gpxName);

  let waypoints = xmlDoc.getElementsByTagName("wpt");
  const routePoints = xmlDoc.getElementsByTagName("rtept");
  console.log("Number of Waypoints:", waypoints.length);
  console.log("Number of Route Points:", routePoints.length);

  if (waypoints.length === 0 && routePoints.length > 0) {
    waypoints = routePoints;
  }

  const gpxNamespaceURI =
    xmlDoc.documentElement.namespaceURI || "http://www.topografix.com/GPX/1/1";
  console.log("GPX Namespace URI:", gpxNamespaceURI);

  const tracks = xmlDoc.getElementsByTagNameNS(gpxNamespaceURI, "trk");
  console.log("Number of Tracks Found:", tracks.length);

  if (tracks.length === 0) {
    throw new Error("No tracks found in the GPX file.");
  }
  if (trackIndex < 0 || trackIndex >= tracks.length) {
    throw new Error(
      `Invalid track index specified. The GPX file contains ${tracks.length} tracks.`
    );
  }

  const parsedWaypoints: Waypoint[] = [];
  const parsedTracks: Track[] = [];
  const pointsWithoutElevation: { lat: number; lon: number }[] = [];

  const trk = tracks[trackIndex];
  const name =
    trk.getElementsByTagNameNS(gpxNamespaceURI, "name")[0]?.textContent || null;
  console.log("Track Name:", name);

  const trksegs = trk.getElementsByTagNameNS(gpxNamespaceURI, "trkseg");
  console.log("Number of Track Segments:", trksegs.length);

  const segments: TrackSegment[] = [];
  for (let j = 0; j < trksegs.length; j++) {
    const seg = trksegs[j];
    const trkpts = seg.getElementsByTagNameNS(gpxNamespaceURI, "trkpt");
    let points: TrackPoint[] = [];

    for (let k = 0; k < trkpts.length; k++) {
      const pt = parseWaypoint(trkpts[k], true) as TrackPoint;
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
    segments.push({ points });
  }
  parsedTracks.push({ name, segments });

  if (pointsWithoutElevation.length > 0) {
    const elevations = await fetchElevationData(pointsWithoutElevation);
    let elevationIndex = 0;

    parsedTracks.forEach((track) => {
      track.segments.forEach((segment) => {
        segment.points.forEach((point) => {
          if (point.ele === null) {
            point.ele = elevations[elevationIndex++];
          }
        });
      });
    });
  }

  parsedTracks.forEach((track) => {
    track.segments = preprocessTrackSegments(track.segments);
    track.segments.forEach((segment) => {
      for (let k = 0; k < segment.points.length; k++) {
        if (k > 0 && k < segment.points.length - 1) {
          const prevPt = segment.points[k - 1];
          const currentPt = segment.points[k];
          const nextPt = segment.points[k + 1];
          currentPt.curve = calculateCurveRadius(prevPt, currentPt, nextPt);
        }
      }
    });
  });

  parsedTracks.forEach((track) => {
    track.segments.forEach((segment) => {
      for (let k = 1; k < segment.points.length; k++) {
        const prevPt = segment.points[k - 1];
        const currentPt = segment.points[k];

        currentPt.slope = calculateSlope(prevPt, currentPt);
      }
    });
  });

  for (let i = 0; i < waypoints.length; i++) {
    const wpt = waypoints[i];
    const parsedWpt = parseWaypoint(wpt) as Waypoint;

    if (parsedWpt && parsedWpt.type !== "shaping") {
      let isClose = false;
      let closestTrackPointRef: TrackPointRef | undefined;

      parsedTracks.forEach((track, trackIndex) => {
        track.segments.forEach((segment, segmentIndex) => {
          segment.points.forEach((point, pointIndex) => {
            if (
              isWithinApproximateDistance(
                parseFloat(parsedWpt.lat),
                parseFloat(parsedWpt.lon),
                parseFloat(point.lat),
                parseFloat(point.lon),
                maxProximityDistance
              )
            ) {
              isClose = true;
              closestTrackPointRef = { trackIndex, segmentIndex, pointIndex };
            }
          });
        });
      });

      if (isClose) {
        parsedWpt.closestTrackpoint = closestTrackPointRef;
        parsedWaypoints.push(parsedWpt);
      } else {
        // console.warn(
        //   `Waypoint ${parsedWpt.name} is too far from the track and will be skipped.`
        // );
      }
    }
  }

  parsedWaypoints.sort((a, b) => {
    if (a.closestTrackpoint && b.closestTrackpoint) {
      if (a.closestTrackpoint.trackIndex !== b.closestTrackpoint.trackIndex) {
        return a.closestTrackpoint.trackIndex - b.closestTrackpoint.trackIndex;
      }
      if (
        a.closestTrackpoint.segmentIndex !== b.closestTrackpoint.segmentIndex
      ) {
        return (
          a.closestTrackpoint.segmentIndex - b.closestTrackpoint.segmentIndex
        );
      }
      return a.closestTrackpoint.pointIndex - b.closestTrackpoint.pointIndex;
    }
    return 0;
  });

  return {
    gpxName,
    waypoints: parsedWaypoints,
    tracks: parsedTracks,
    trackParts: calculateTrackParts(parsedWaypoints, parsedTracks),
  };
}

function parseWaypoint(
  element: Element,
  isTrackPoint: boolean = false
): Waypoint | TrackPoint | null {
  const lat = element.getAttribute("lat");
  const lon = element.getAttribute("lon");
  const name = element.getElementsByTagName("name")[0]?.textContent;
  const desc = element.getElementsByTagName("desc")[0]?.textContent;
  const type = element.getElementsByTagName("type")[0]?.textContent || null;
  const sym = element.getElementsByTagName("sym")[0]?.textContent || null;

  if (lat !== null && lon !== null) {
    let ele: number | null = null;

    if (isTrackPoint) {
      const eleText = element.getElementsByTagName("ele")[0]?.textContent;
      ele =
        eleText !== undefined && eleText !== null ? parseFloat(eleText) : null;

      return {
        type,
        lat,
        lon,
        name,
        desc,
        sym,
        ele,
        curve: null,
        slope: null,
      };
    }

    if (type === "shaping") return null;

    return { type, lat, lon, name, desc, sym };
  }

  console.warn("Skipping point with missing lat or lon");
  return null;
}
