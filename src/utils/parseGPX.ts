interface Waypoint {
  lat: string | null;
  lon: string | null;
  name: string | null;
  desc: string | null;
}

interface RoutePoint extends Waypoint {}

interface Route {
  name: string | null;
  points: RoutePoint[];
}

interface TrackPoint extends Waypoint {
  ele: string | null; // Elevation
  time: string | null; // Timestamp
}

interface TrackSegment {
  points: TrackPoint[];
}

interface Track {
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
        const trkpt = trkpts[k];
        const pt = parseWaypoint(trkpt, true) as TrackPoint; // Cast to TrackPoint to include ele and time
        if (pt) points.push(pt);
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

  if (lat !== null && lon !== null) {
    const waypoint: Waypoint = { lat, lon, name, desc };
    if (isTrackPoint) {
      const ele = element.getElementsByTagName("ele")[0]?.textContent;
      const time = element.getElementsByTagName("time")[0]?.textContent;
      return { ...waypoint, ele, time };
    }
    return waypoint;
  } else {
    console.warn("Skipping point with missing lat or lon");
    return null;
  }
}
