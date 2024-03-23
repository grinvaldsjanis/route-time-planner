import calculateCurveRadius from "./calculateCurvature";

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
}

interface TrackSegment {
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
      const points: TrackPoint[] = [];

      // Inside the loop where you're parsing track points (trkpts)
      for (let k = 0; k < trkpts.length; k++) {
        const trkpt = trkpts[k];
        let curve = 10000; // Default value, used for the first and last points

        // Calculate curveRadius only for points that are neither the first nor the last
        if (k > 0 && k < trkpts.length - 1) {
          const prevPoint = parseWaypoint(trkpts[k - 1], true) as TrackPoint;
          const currentPoint = parseWaypoint(trkpt, true) as TrackPoint;
          const nextPoint = parseWaypoint(trkpts[k + 1], true) as TrackPoint;
          curve = calculateCurveRadius(
            prevPoint,
            currentPoint,
            nextPoint
          );
        }

        const pt = parseWaypoint(trkpt, true) as TrackPoint;
        if (pt) {
          pt.curve = curve;
          points.push(pt);
        }
      }

      segments.push({ points });
    }

    parsedTracks.push({ name, segments });
  }
console.log("Tracks", parsedTracks)
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
      ele = eleText !== null ? parseFloat(eleText) : null; // Convert elevation to number or null
      // Assuming time remains as string, or convert if necessary
    }

    const waypoint: Waypoint = { type, lat, lon, name, desc, sym };
    if (isTrackPoint) {
      return { ...waypoint, ele, time, curve: null };
    }
    return waypoint;
  } else {
    console.warn("Skipping point with missing lat or lon");
    return null;
  }
}
