import travelModes from "../constants/travelModes";
import calculateTravelTime from "./calculateTravelTime";
import haversineDistance from "./haversineDistance";
import { Track, TrackPart, TrackPoint, TrackWaypoint } from "./types";

const calculateTrackParts = (
  waypoints: TrackWaypoint[],
  track: Track,
  modeKey: keyof typeof travelModes
): TrackPart[] => {
  const trackParts: TrackPart[] = [];

  const calculateTotalDistance = (
    points: TrackPoint[],
    startIndex: number,
    endIndex: number
  ): number => {
    let totalDistance = 0;
    for (let i = startIndex; i < endIndex; i++) {
      totalDistance += haversineDistance(
        parseFloat(points[i].lat),
        parseFloat(points[i].lon),
        parseFloat(points[i + 1].lat),
        parseFloat(points[i + 1].lon)
      );
    }
    return totalDistance / 1000; // Convert to kilometers
  };

  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    const startIndex = wp1.closestTrackPointIndex!;
    const endIndex = wp2.closestTrackPointIndex!;

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      const distance = calculateTotalDistance(track.points, startIndex, endIndex);

      // Removed trackIndex, updated to fit the new TrackPart structure
      const trackPart: TrackPart = {
        startIndex,
        endIndex,
        distance,
        travelTime: 0,
        durationMultiplier: 1,
      };

      // Pass the single TrackPart instead of an array
      trackPart.travelTime = calculateTravelTime(trackPart, track, modeKey);

      trackParts.push(trackPart);
    } else {
      console.warn(`Invalid start or end index for waypoint ${i}`);
    }
  }

  return trackParts;
};

export default calculateTrackParts;
