import { TrackPart, Waypoint } from "./types";

const calculateRelativeTimes = (
  waypoints: Waypoint[],
  trackParts: TrackPart[]
) => {
  let cumulativeTime = 0;
  return waypoints.map((waypoint, index) => {
    const travelTime = index > 0 ? trackParts[index - 1].travelTime * trackParts[index - 1].durationMultiplier : 0;    const stopTime = waypoint.stopTime ? waypoint.stopTime * 60 : 0;

    cumulativeTime += travelTime;
    const arrivalSeconds = cumulativeTime;

    const departureSeconds = arrivalSeconds + stopTime;
    cumulativeTime = departureSeconds;

    return {
      ...waypoint,
      relativeTimes: {
        arrivalSeconds,
        departureSeconds,
      },
    };
  });
};

export default calculateRelativeTimes;
