import formatTimeToHHMM from "./formatTimeToHHMM";
import { GPXData } from "./types";
import { minutesToSeconds, formatTimeFromSeconds } from "./timeUtils";

export default function createGPX(gpxData: GPXData, startTime: string, gpxName: string) {
  const serializer = new XMLSerializer();
  const xmlDoc = document.implementation.createDocument(null, "gpx", null);
  const gpx = xmlDoc.documentElement;
  gpx.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");
  gpx.setAttribute("creator", "Route Time Planner");
  gpx.setAttribute("version", "1.1");

  const metadata = xmlDoc.createElement("metadata");
  const name = xmlDoc.createElement("name");
  name.textContent = gpxName;
  metadata.appendChild(name);

  const link = xmlDoc.createElement("link");
  link.setAttribute("href", "https://route-time-planner.vercel.app/");
  const text = xmlDoc.createElement("text");
  text.textContent = "Route Time Planner";
  link.appendChild(text);
  metadata.appendChild(link);

  gpx.appendChild(metadata);

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  let currentSeconds = 0;
  const times = gpxData.waypoints.map((waypoint, index) => {
    let arrivalSeconds = currentSeconds;
    let departureSeconds = currentSeconds;

    if (index > 0) {
      const travelTime = gpxData.trackParts[index - 1].travelTime;
      arrivalSeconds = currentSeconds += travelTime;
    }

    const stopTimeSeconds = minutesToSeconds(waypoint.stopTime || 0);
    departureSeconds = currentSeconds += stopTimeSeconds;

    return {
      arrivalTime: formatTimeFromSeconds(arrivalSeconds + startTimeSeconds),
      departureTime: formatTimeFromSeconds(departureSeconds + startTimeSeconds)
    };
  });

  gpxData.waypoints.forEach((waypoint, index) => {
    const wpt = xmlDoc.createElement("wpt");
    wpt.setAttribute("lat", waypoint.lat);
    wpt.setAttribute("lon", waypoint.lon);

    let waypointName = waypoint.name || `Waypoint ${index + 1}`;

    if (index === 0) {
      waypointName += ` (${formatTimeToHHMM(times[index].departureTime)})`;
    } else if (waypoint.stopTime && waypoint.stopTime > 0) {
      waypointName += ` (${formatTimeToHHMM(
        times[index].arrivalTime
      )} - ${formatTimeToHHMM(times[index].departureTime)})`;
    }
    if (index === gpxData.waypoints.length - 1) {
      waypointName += ` (${formatTimeToHHMM(times[index].arrivalTime)})`;
    }

    const name = xmlDoc.createElement("name");
    name.textContent = waypointName;
    wpt.appendChild(name);

    if (waypoint.desc) {
      const desc = xmlDoc.createElement("desc");
      desc.textContent = waypoint.desc;
      wpt.appendChild(desc);
    }

    if (waypoint.type) {
      const type = xmlDoc.createElement("type");
      type.textContent = waypoint.type;
      wpt.appendChild(type);
    }

    if (waypoint.sym) {
      const sym = xmlDoc.createElement("sym");
      sym.textContent = waypoint.sym;
      wpt.appendChild(sym);
    }

    gpx.appendChild(wpt);
  });

  gpxData.tracks.forEach((track) => {
    const trk = xmlDoc.createElement("trk");
    if (track.name) {
      const name = xmlDoc.createElement("name");
      name.textContent = track.name;
      trk.appendChild(name);
    }

    const trkseg = xmlDoc.createElement("trkseg");
    track.points.forEach((point) => {
      const trkpt = xmlDoc.createElement("trkpt");
      trkpt.setAttribute("lat", point.lat);
      trkpt.setAttribute("lon", point.lon);
      if (point.ele !== null) {
        const ele = xmlDoc.createElement("ele");
        ele.textContent = point.ele.toString();
        trkpt.appendChild(ele);
      }
      trkseg.appendChild(trkpt);
    });
    trk.appendChild(trkseg);
    gpx.appendChild(trk);
  });

  return serializer.serializeToString(xmlDoc);
}
