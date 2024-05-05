import formatTimeToHHMM from "./formatTimeToHHMM";
import { GPXData } from "./parseGPX";
import { minutesToSeconds, formatTimeFromSeconds } from "./timeUtils";

export default function createGPX(gpxData: GPXData, startTime: string) {
  const serializer = new XMLSerializer();
  const xmlDoc = document.implementation.createDocument(null, "gpx", null);
  const gpx = xmlDoc.documentElement;
  gpx.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");
  gpx.setAttribute("creator", "YourApp");
  gpx.setAttribute("version", "1.1");

  // Parse the start time into seconds
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  // Initialize travel time starting from zero
  let currentSeconds = 0;
  const times = gpxData.waypoints.map((waypoint, index) => {
    let arrivalSeconds = currentSeconds;
    let departureSeconds = currentSeconds;

    // Calculate travel time to the current waypoint, except for the first one
    if (index > 0) {
      const travelTime = gpxData.trackParts[index - 1].travelTime;
      arrivalSeconds = currentSeconds += travelTime;
    }

    // Calculate departure time by adding the stop time, if any
    const stopTimeSeconds = minutesToSeconds(waypoint.stopTime || 0);
    departureSeconds = currentSeconds += stopTimeSeconds;

    // Return the formatted times with the starting time offset
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

    // Check for the first waypoint to add departure time
    if (index === 0) {
      waypointName += ` (${formatTimeToHHMM(times[index].departureTime)})`;
    }
    // Add arrival and departure times for intermediate waypoints with stop time
    else if (waypoint.stopTime && waypoint.stopTime > 0) {
      waypointName += ` (${formatTimeToHHMM(
        times[index].arrivalTime
      )} - ${formatTimeToHHMM(times[index].departureTime)})`;
    }
    // Add only arrival time for the final waypoint
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

    gpx.appendChild(wpt);
  });

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
