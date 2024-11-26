import formatTimeToHHMM from "./formatTimeToHHMM";
import { GPXData } from "./types";
import { minutesToSeconds, formatTimeFromSeconds } from "./timeUtils";
import { setInProgress } from "../context/actions";

export default async function createGPX(
  gpxData: GPXData,
  startTime: string,
  gpxName: string,
  dispatch: (action: any) => void
) {
  console.log("Starting GPX creation...");

  const serializer = new XMLSerializer();
  const xmlDoc = document.implementation.createDocument(null, "gpx", null);
  const gpx = xmlDoc.documentElement;
  gpx.setAttribute("xmlns", "http://www.topografix.com/GPX/1/1");
  gpx.setAttribute("creator", "Route Time Planner");
  gpx.setAttribute("version", "1.1");

  dispatch(setInProgress(true, "Preparing metadata..."));

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

  // Process waypoints asynchronously
  dispatch(setInProgress(true, "Processing waypoints..."));
  const times = await new Promise<{ arrivalTime: string; departureTime: string }[]>(async (resolve) => {
    const timesArray: { arrivalTime: string; departureTime: string }[] = [];
    for (const [index, waypoint] of gpxData.referenceWaypoints.entries()) {
      let arrivalSeconds = currentSeconds;
      let departureSeconds = currentSeconds;

      if (index > 0) {
        const travelTime = gpxData.tracks[0].parts[index - 1]?.travelTime || 0;
        arrivalSeconds = currentSeconds += travelTime;
      }

      const stopTimeSeconds = minutesToSeconds(
        gpxData.tracks[0].waypoints.find((wp) => wp.referenceId === waypoint.id)
          ?.stopTime || 0
      );
      departureSeconds = currentSeconds += stopTimeSeconds;

      timesArray.push({
        arrivalTime: formatTimeFromSeconds(arrivalSeconds + startTimeSeconds),
        departureTime: formatTimeFromSeconds(departureSeconds + startTimeSeconds),
      });

      // Pause between batches to prevent blocking
      if (index % 50 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    resolve(timesArray);
  });

  // Append waypoints asynchronously
  dispatch(setInProgress(true, "Appending waypoints..."));
  for (const [index, waypoint] of gpxData.referenceWaypoints.entries()) {
    const wpt = xmlDoc.createElement("wpt");
    wpt.setAttribute("lat", waypoint.lat);
    wpt.setAttribute("lon", waypoint.lon);

    let waypointName = waypoint.name || `Waypoint ${index + 1}`;

    if (index === 0) {
      waypointName += ` (${formatTimeToHHMM(times[index].departureTime)})`;
    } else if (
      gpxData.tracks[0].waypoints.find((wp) => wp.referenceId === waypoint.id)
        ?.stopTime &&
      gpxData.tracks[0].waypoints.find((wp) => wp.referenceId === waypoint.id)
        ?.stopTime! > 0
    ) {
      waypointName += ` (${formatTimeToHHMM(
        times[index].arrivalTime
      )} - ${formatTimeToHHMM(times[index].departureTime)})`;
    }
    if (index === gpxData.referenceWaypoints.length - 1) {
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

    // Pause between batches to prevent blocking
    if (index % 50 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Append tracks asynchronously
  dispatch(setInProgress(true, "Appending tracks..."));
  for (const track of gpxData.tracks) {
    const trk = xmlDoc.createElement("trk");
    if (track.name) {
      const name = xmlDoc.createElement("name");
      name.textContent = track.name;
      trk.appendChild(name);
    }

    const trkseg = xmlDoc.createElement("trkseg");
    for (const [index, point] of track.points.entries()) {
      const trkpt = xmlDoc.createElement("trkpt");
      trkpt.setAttribute("lat", point.lat);
      trkpt.setAttribute("lon", point.lon);
      if (point.ele !== null) {
        const ele = xmlDoc.createElement("ele");
        ele.textContent = point.ele.toString();
        trkpt.appendChild(ele);
      }
      trkseg.appendChild(trkpt);

      // Pause between batches to prevent blocking
      if (index % 50 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    trk.appendChild(trkseg);
    gpx.appendChild(trk);
  }

  dispatch(setInProgress(false, ""));
  return serializer.serializeToString(xmlDoc);
}
