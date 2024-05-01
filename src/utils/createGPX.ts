import { addTimes, convertMinutesToHHMMSS } from "./addTimes";
import formatTimeToHHMM from "./formatTimeToHHMM";
import { GPXData, Waypoint, TrackPart } from "./parseGPX";

export default function createGPX(gpxData: GPXData, startTime: string) {
  const serializer = new XMLSerializer();
  const xmlDoc = document.implementation.createDocument(null, "gpx", null);
  const gpx = xmlDoc.documentElement;
  gpx.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");
  gpx.setAttribute("creator", "GPX Time Planner");
  gpx.setAttribute("version", "1.1");

  let currentTime = startTime;

  // Calculate times
  const times = gpxData.waypoints.map((waypoint, index) => {
    if (index > 0) {
      const travelTime = gpxData.trackParts[index - 1].travelTime; // Ensure trackParts aligns with waypoints by index
      currentTime = addTimes(
        currentTime,
        convertMinutesToHHMMSS(travelTime / 60)
      ); // Assuming travelTime is in seconds
    }

    let arrivalTime = currentTime;
    let departureTime = currentTime;

    if (waypoint.stopTime && waypoint.stopTime > 0) {
      departureTime = addTimes(
        currentTime,
        convertMinutesToHHMMSS(waypoint.stopTime)
      );
      currentTime = departureTime;
    }

    return { arrivalTime, departureTime };
  });

  // Append waypoints with calculated times
  gpxData.waypoints.forEach((waypoint, index) => {
    const wpt = xmlDoc.createElement("wpt");
    wpt.setAttribute("lat", waypoint.lat);
    wpt.setAttribute("lon", waypoint.lon);

    let waypointName = waypoint.name || `Waypoint ${index + 1}`;

    if (index === 0) {
      // Start time for the first waypoint
      waypointName += ` (${formatTimeToHHMM(startTime)})`;
    } else if (index === gpxData.waypoints.length - 1) {
      // Arrival time for the last waypoint
      const { arrivalTime } = times[index];
      waypointName += `(${formatTimeToHHMM(arrivalTime)})`;
    } else if (waypoint.stopTime && waypoint.stopTime > 0) {
      // Stop times for waypoints in between
      const { arrivalTime, departureTime } = times[index];
      waypointName += `(${formatTimeToHHMM(arrivalTime)} - ${formatTimeToHHMM(
        departureTime
      )})`;
    }

    const name = xmlDoc.createElement("name");
    name.textContent = waypointName;
    wpt.appendChild(name);

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
