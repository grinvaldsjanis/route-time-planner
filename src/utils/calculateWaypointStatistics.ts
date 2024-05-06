import { GPXData } from "../utils/parseGPX";
import { minutesToSeconds, formatTimeFromSeconds } from "../utils/timeUtils";

interface WaypointStatistics {
  totalDistance: number;
  totalTravelTime: number;
  totalJourneyTime: string;
  finalArrivalTime: string;
}

export default function calculateWaypointStatistics(
    gpxData: GPXData,
    startTime: string | undefined
  ): WaypointStatistics {
    if (!gpxData || !gpxData.trackParts || !gpxData.waypoints) {
      console.warn("Insufficient GPX data provided.");
      return {
        totalDistance: 0,
        totalTravelTime: 0,
        totalJourneyTime: "0:00",
        finalArrivalTime: "0:00",
      };
    }
  
    // Ensure startTime has a valid fallback value
    const [startHour, startMinute] = (startTime ?? "08:00").split(":").map(Number);
    const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);
  
    let currentSeconds = 0;
    const arrivalSeconds: number[] = [];
    const departureSeconds: number[] = [];
    let totalJourneySeconds = 0;
  
    gpxData.waypoints.forEach((waypoint, index) => {
      if (index > 0) {
        currentSeconds += gpxData.trackParts[index - 1].travelTime;
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
      totalDistance: gpxData.trackParts.reduce((acc, part) => acc + part.distance, 0),
      totalTravelTime: gpxData.trackParts.reduce((acc, part) => acc + part.travelTime, 0),
      totalJourneyTime: formatTimeFromSeconds(totalJourneySeconds),
      finalArrivalTime: formatTimeFromSeconds(finalArrivalSeconds),
    };
  }
  