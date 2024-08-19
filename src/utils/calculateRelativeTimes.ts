import { TrackWaypoint, TrackPart } from "./types";

const calculateRelativeTimes = (
  waypoints: TrackWaypoint[],
  trackParts: TrackPart[]
): TrackWaypoint[] => {
  let currentTimeInSeconds = 0; // Tracks the total elapsed time

  return waypoints.map((waypoint, waypointIndex) => {
    // For waypoints with index > 0, calculate the travel time from the previous waypoint
    if (waypointIndex > 0) {
      const correspondingTrackPart = trackParts[waypointIndex - 1]; // Get the track part for the previous waypoint
      currentTimeInSeconds += correspondingTrackPart.travelTime * (correspondingTrackPart.durationMultiplier ?? 1);
    }

    // Calculate the arrival time for the current waypoint
    const arrivalTime = currentTimeInSeconds;

    // Calculate the stop time in seconds (if applicable)
    const stopTimeInSeconds = (waypoint.stopTime ?? 0) * 60;

    // Calculate the departure time (arrival time + stop time)
    const departureTime = arrivalTime + stopTimeInSeconds;

    // Return the updated waypoint with relative times
    return {
      ...waypoint,
      relativeTimes: {
        arrivalSeconds: arrivalTime,
        departureSeconds: departureTime,
      },
    };
  });
};

export default calculateRelativeTimes;
