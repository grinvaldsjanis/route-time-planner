import { GPXData } from "./parseGPX";

export default function createGPX(gpxData: GPXData) {
  const serializer = new XMLSerializer();
  const xmlDoc = document.implementation.createDocument(null, "gpx", null);
  const gpx = xmlDoc.documentElement;
  gpx.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");
  gpx.setAttribute("creator", "YourApp");
  gpx.setAttribute("version", "1.1");

  // Append waypoints
  gpxData.waypoints.forEach((waypoint) => {
    const wpt = xmlDoc.createElement("wpt");
    wpt.setAttribute("lat", waypoint.lat);
    wpt.setAttribute("lon", waypoint.lon);
    if (waypoint.name) {
      const name = xmlDoc.createElement("name");
      name.textContent = waypoint.name;
      wpt.appendChild(name);
    }
    if (waypoint.desc) {
      const desc = xmlDoc.createElement("desc");
      desc.textContent = waypoint.desc;
      wpt.appendChild(desc);
    }
    gpx.appendChild(wpt);
  });

  // Append tracks
  gpxData.tracks.forEach((track) => {
    const trk = xmlDoc.createElement("trk");
    if (track.name) {
      const name = xmlDoc.createElement("name");
      name.textContent = track.name;
      trk.appendChild(name);
    }

    track.segments.forEach((segment) => {
      const trkseg = xmlDoc.createElement("trkseg");
      segment.points.forEach((point) => {
        const trkpt = xmlDoc.createElement("trkpt");
        trkpt.setAttribute("lat", point.lat);
        trkpt.setAttribute("lon", point.lon);
        if (point.ele !== null) {
          const ele = xmlDoc.createElement("ele");
          ele.textContent = point.ele.toString();
          trkpt.appendChild(ele);
        }
        if (point.time) {
          const time = xmlDoc.createElement("time");
          time.textContent = point.time;
          trkpt.appendChild(time);
        }
        trkseg.appendChild(trkpt);
      });
      trk.appendChild(trkseg);
    });
    gpx.appendChild(trk);
  });

  return serializer.serializeToString(xmlDoc);
}
