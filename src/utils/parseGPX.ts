import travelModes from "../constants/travelModes";
import calculateCurveRadius from "./calculateCurvature";
import calculateSlope from "./calculateSlope";
import calculateTrackParts from "./calculateTrackParts";
import { preprocessTrackSegments } from "./preprocessNewPoints";

export interface TrackPointRef {
  trackIndex: number;
  segmentIndex: number;
  pointIndex: number;
}

export interface GPXData {
  waypoints: Waypoint[];
  tracks: Track[];
  trackParts: TrackPart[];
}

export interface TrackPart {
  waypoints: number[];
  trackPoints: {
    trackIndex: number;
    segmentIndex: number;
    startIndex: number;
    endIndex: number;
  }[];
  distance: number;
  travelTime: number;
}

export interface Waypoint {
  type: string | null;
  lat: string;
  lon: string;
  name: string | null;
  desc: string | null;
  sym: string | null;
  closestTrackpoint?: TrackPointRef;
  stopTime?: number;
}


export interface TrackPoint {
  lat: string;
  lon: string;
  ele: number | null;
  time: string | null;
  curve: number | null;
  slope: number | null;
}

export interface TrackSegment {
  points: TrackPoint[];
}

export interface Track {
  name: string | null;
  segments: TrackSegment[];
}

function isWithinApproximateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  const maxDistanceKm = 5;
  return (
    Math.abs(lat1 - lat2) * 111 <= maxDistanceKm &&
    Math.abs(lon1 - lon2) * 111 <= maxDistanceKm
  );
}

export default function parseGPX(gpxContent: string, modeKey: string): GPXData {
  if (!(modeKey in travelModes)) {
    throw new Error("Invalid travel mode key");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

  const waypoints = xmlDoc.getElementsByTagName("wpt");
  const tracks = xmlDoc.getElementsByTagName("trk");

  const parsedWaypoints: Waypoint[] = [];
  const parsedTracks: Track[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const trk = tracks[i];
    const name = trk.getElementsByTagName("name")[0]?.textContent;
    const trksegs = trk.getElementsByTagName("trkseg");

    const segments: TrackSegment[] = [];
    for (let j = 0; j < trksegs.length; j++) {
      const seg = trksegs[j];
      const trkpts = seg.getElementsByTagName("trkpt");
      let points: TrackPoint[] = [];

      // Parse points
      for (let k = 0; k < trkpts.length; k++) {
        const pt = parseWaypoint(trkpts[k], true) as TrackPoint;
        if (pt) points.push(pt);
      }

      // Preprocess the segment points to add interpolated points
      let preprocessedSegment = preprocessTrackSegments([{ points }])[0];

      // Calculate curvature for all points, including interpolated ones
      for (let k = 0; k < preprocessedSegment.points.length; k++) {
        if (k > 0 && k < preprocessedSegment.points.length - 1) {
          // Calculate curvature using three consecutive points
          const prevPt = preprocessedSegment.points[k - 1];
          const currentPt = preprocessedSegment.points[k];
          const nextPt = preprocessedSegment.points[k + 1];

          currentPt.curve = calculateCurveRadius(prevPt, currentPt, nextPt);
          currentPt.slope = calculateSlope(prevPt, currentPt);
        }
      }

      segments.push(preprocessedSegment);
    }

    parsedTracks.push({ name, segments });
  }
  for (let i = 0; i < waypoints.length; i++) {
    const wpt = waypoints[i];
    const parsedWpt = parseWaypoint(wpt) as Waypoint;
    if (parsedWpt) {
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
    let ele = null;
    let time = element.getElementsByTagName("time")[0]?.textContent || null;

    if (isTrackPoint) {
      const eleText = element.getElementsByTagName("ele")[0]?.textContent;
      ele = eleText !== null ? parseFloat(eleText) : null;

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

    return { type, lat, lon, name, desc, sym };
  }

  console.warn("Skipping point with missing lat or lon");
  return null;
}
