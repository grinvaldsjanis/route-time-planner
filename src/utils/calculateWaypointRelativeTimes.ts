import { GPXData } from "./parseGPX";

interface WaypointRelativeTimes {
  arrivalSeconds: number;
  departureSeconds: number;
}

const calculateWaypointRelativeTimes = (
  gpxData: GPXData,
  index: number,
): WaypointRelativeTimes | null => {
  const waypoints = gpxData?.waypoints;
  if (!waypoints || !gpxData.trackParts) {
    return null;
  }

  let totalSeconds = 0;

  for (let i = 0; i <= index; i++) {
    if (i > 0) {
      const trackPart = gpxData.trackParts[i - 1];
      if (!trackPart) {
        return null;
      }
      totalSeconds += trackPart.travelTime;
      const prevWaypoint = waypoints[i - 1];
      if (prevWaypoint?.stopTime) {
        totalSeconds += prevWaypoint.stopTime * 60;
      }
    }
  }

  const waypoint = waypoints[index];
  if (!waypoint) {
    return null;
  }

  return {
    arrivalSeconds: totalSeconds,
    departureSeconds: totalSeconds + (waypoint.stopTime || 0) * 60,
  };
};

export default calculateWaypointRelativeTimes;
