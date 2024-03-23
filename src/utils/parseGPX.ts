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
      const points: TrackPoint[] = [];

      for (let k = 0; k < trkpts.length; k++) {
        const pt = parseWaypoint(trkpts[k], true) as TrackPoint;

        if (!pt) continue;

        if (k > 0 && k < trkpts.length - 1) {
          const prevPt = parseWaypoint(trkpts[k - 1], true) as TrackPoint;
          const nextPt = parseWaypoint(trkpts[k + 1], true) as TrackPoint;

          // Check if prevPt and nextPt are not null
          if (prevPt && nextPt) {
            const curve = calculateCurveRadius(prevPt, pt, nextPt);

            pt.curve = isNaN(curve) ? 1000 : curve;
          } else {
            pt.curve = 1000;
          }
        } else {
          pt.curve = 1000;
        }

        points.push(pt);
      }

      segments.push({ points });
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
        curve: null, // curve initialized to null
      };
    }

    // For Waypoint, we return the necessary properties
    return { type, lat, lon, name, desc, sym };
  } else {
    console.warn("Skipping point with missing lat or lon");
    return null;
  }
}
