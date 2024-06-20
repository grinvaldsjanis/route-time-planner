import travelModes from "../constants/travelModes";
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
import haversineDistance from "./haversineDistance";

export default async function parseGPX(
  gpxContent: string,
  modeKey: string
): Promise<GPXData> {
  if (!(modeKey in travelModes)) {
    throw new Error("Invalid travel mode key");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

  const gpxName =
    xmlDoc.getElementsByTagName("metadata")[0]?.getElementsByTagName("name")[0]
      ?.textContent || null;
  let waypoints = xmlDoc.getElementsByTagName("wpt");
  const routePoints = xmlDoc.getElementsByTagName("rtept");
  const tracks = xmlDoc.getElementsByTagName("trk");

  if (waypoints.length === 0 && routePoints.length > 0) {
    waypoints = routePoints;
  }

  const parsedWaypoints: Waypoint[] = [];
  const parsedTracks: Track[] = [];
  const pointsWithoutElevation: { lat: number; lon: number }[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const trk = tracks[i];
    const name = trk.getElementsByTagName("name")[0]?.textContent;
    const trksegs = trk.getElementsByTagName("trkseg");

    const segments: TrackSegment[] = [];
    for (let j = 0; j < trksegs.length; j++) {
      const seg = trksegs[j];
      const trkpts = seg.getElementsByTagName("trkpt");
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
  }

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
      let closestDistance = Infinity;
      let closestTrackPointRef: TrackPointRef | undefined;

      parsedTracks.forEach((track, trackIndex) => {
        track.segments.forEach((segment, segmentIndex) => {
          segment.points.forEach((point, pointIndex) => {
            if (
              isWithinApproximateDistance(
                parseFloat(parsedWpt.lat),
                parseFloat(parsedWpt.lon),
                parseFloat(point.lat),
                parseFloat(point.lon)
              )
            ) {
              const distance = Math.sqrt(
                Math.pow(parseFloat(parsedWpt.lat) - parseFloat(point.lat), 2) +
                  Math.pow(parseFloat(parsedWpt.lon) - parseFloat(point.lon), 2)
              );

              if (distance < closestDistance) {
                closestDistance = distance;
                closestTrackPointRef = { trackIndex, segmentIndex, pointIndex };
              }
            }
          });
        });
      });

      parsedWpt.closestTrackpoint = closestTrackPointRef;
      parsedWaypoints.push(parsedWpt);
    }
  }

  return {
    gpxName,
    waypoints: parsedWaypoints,
    tracks: parsedTracks,
    trackParts: calculateTrackParts(
      parsedWaypoints,
      parsedTracks,
      modeKey as keyof typeof travelModes
    ),
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
    let time = element.getElementsByTagName("time")[0]?.textContent || null;

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
        time,
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
