import { Track, TrackPart, TrackWaypoint } from "../utils/types";
import { minutesToSeconds, formatTimeFromSeconds } from "../utils/timeUtils";

interface WaypointStatistics {
  totalDistance: number;
  totalTravelTime: number;
  totalJourneyTime: string;
  finalArrivalTime: string;
}

export default function calculateWaypointStatistics(
  track: Track,
  startTime: string | undefined
): WaypointStatistics {
  if (!track || !track.waypoints || !track.parts) {
    console.warn("Insufficient track data provided.");
    return {
      totalDistance: 0,
      totalTravelTime: 0,
      totalJourneyTime: "0:00",
      finalArrivalTime: "0:00",
    };
  }

  const [startHour, startMinute] = (startTime ?? "08:00").split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  let currentSeconds = 0;
  const arrivalSeconds: number[] = [];
  const departureSeconds: number[] = [];
  let totalJourneySeconds = 0;

  // Use only the current track's parts and waypoints
  const trackParts: TrackPart[] = track.parts;
  const trackWaypoints: TrackWaypoint[] = track.waypoints;

  trackWaypoints.forEach((waypoint, index) => {
    if (index > 0) {
      const trackPart = trackParts[index - 1]; // Get the previous part
      if (trackPart) {
        currentSeconds += Math.round((trackPart.travelTime ?? 0) * (trackPart.durationMultiplier ?? 1));
      }
    }


    arrivalSeconds.push(currentSeconds);

    const stopTimeSeconds = minutesToSeconds(waypoint.stopTime || 0);
    const departureTime = currentSeconds + stopTimeSeconds;
    departureSeconds.push(departureTime);

    currentSeconds = departureTime;
  });

  totalJourneySeconds = currentSeconds;
  const finalArrivalSeconds = arrivalSeconds[arrivalSeconds.length - 1] + startTimeSeconds;

  return {
    totalDistance: trackParts.reduce((acc, part) => acc + (part?.distance ?? 0), 0),
    totalTravelTime: trackParts.reduce((acc, part) => acc + (part?.travelTime ?? 0), 0),
    totalJourneyTime: formatTimeFromSeconds(totalJourneySeconds),
    finalArrivalTime: formatTimeFromSeconds(finalArrivalSeconds),
  };
}
