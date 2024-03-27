import calculateCurveRadius from "./calculateCurvature";
import  calculateSlope  from "./calculateSlope";
import { preprocessTrackSegments } from "./preprocessNewPoints";

export interface GPXData {
  waypoints: Waypoint[];
  routes: Route[];
  tracks: Track[];
}

export interface Waypoint {
  type: string | null;
  lat: string;
  lon: string;
  name: string | null;
  desc: string | null;
  sym: string | null;
}
interface RoutePoint extends Waypoint {}

export interface Route {
  name: string | null;
  points: RoutePoint[];
}

export interface TrackPoint extends Waypoint {
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

export default function parseGPX(gpxContent: string): {
  waypoints: Waypoint[];
  routes: Route[];
  tracks: Track[];
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, "application/xml");

  const waypoints = xmlDoc.getElementsByTagName("wpt");
  const routes = xmlDoc.getElementsByTagName("rte");
  const tracks = xmlDoc.getElementsByTagName("trk");

  const parsedWaypoints: Waypoint[] = [];
  const parsedRoutes: Route[] = [];
  const parsedTracks: Track[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const wpt = waypoints[i];
    const parsedWpt = parseWaypoint(wpt);
    if (parsedWpt) parsedWaypoints.push(parsedWpt);
  }

  for (let i = 0; i < routes.length; i++) {
    const rte = routes[i];
    const name = rte.getElementsByTagName("name")[0]?.textContent;
    const rtepts = rte.getElementsByTagName("rtept");
    const points: RoutePoint[] = [];

    for (let j = 0; j < rtepts.length; j++) {
      const pt = parseWaypoint(rtepts[j]);
      if (pt) points.push(pt);
    }

    parsedRoutes.push({ name, points });
  }

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

  return {
    waypoints: parsedWaypoints,
    routes: parsedRoutes,
    tracks: parsedTracks,
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
  let ele = null;
  let time = element.getElementsByTagName("time")[0]?.textContent || null;

  if (lat !== null && lon !== null) {
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
  } else {
    console.warn("Skipping point with missing lat or lon");
    return null;
  }
}
