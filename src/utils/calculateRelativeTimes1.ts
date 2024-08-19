import { TrackWaypoint, TrackPart } from "./types";

const calculateRelativeTimes = (
  waypoints: TrackWaypoint[],
  trackParts: TrackPart[],
  startTimeSeconds: number
): TrackWaypoint[] => {
  let currentSeconds = 0;

  return waypoints.map((waypoint, index) => {
    if (index > 0 && index - 1 < trackParts.length) {
      const trackPart = trackParts[index - 1]; // Get the part before this waypoint
      currentSeconds +=
        (trackPart.travelTime ?? 0) * (trackPart.durationMultiplier ?? 1);
    }

    const arrivalTime = currentSeconds;

    const stopTimeSeconds = (waypoint.stopTime ?? 0) * 60; // Convert minutes to seconds
    const departureTime = arrivalTime + stopTimeSeconds;

    currentSeconds = departureTime;

    return {
      ...waypoint,
      relativeTimes: {
        arrivalSeconds: arrivalTime + startTimeSeconds, // Adjust with start time
        departureSeconds: departureTime + startTimeSeconds,
      },
    };
  });
};

export default calculateRelativeTimes;
