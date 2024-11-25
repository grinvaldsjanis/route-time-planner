import { Track, TrackPart } from "./types";
import haversineDistance from "./haversineDistance";
import travelModes from "../constants/travelModes";
import calculateSpeed from "./calculateSpeed";

const calculateTravelTime = (
  trackPart: TrackPart,
  track: Track,
  modeKey: keyof typeof travelModes
): number => {
  const mode = travelModes[modeKey];

  if (!mode) {
    console.error("Invalid travel mode key:", modeKey);
    return 0;
  }

  const points = track.points;

  if (
    trackPart.startIndex < 0 ||
    trackPart.endIndex >= points.length ||
    trackPart.startIndex >= trackPart.endIndex
  ) {
    console.error(
      "Invalid start or end index",
      trackPart.startIndex,
      trackPart.endIndex
    );
    return 0;
  }

  let totalTime = 0;

  for (let i = trackPart.startIndex; i < trackPart.endIndex; i++) {
    const pointA = points[i];
    const pointB = points[i + 1];
    const distance = haversineDistance(
      parseFloat(pointA.lat),
      parseFloat(pointA.lon),
      parseFloat(pointB.lat),
      parseFloat(pointB.lon)
    );

    // Use the calculateSpeed function for speed determination
    const effectiveSpeedA = calculateSpeed(pointA, modeKey); // Speed at point A
    const effectiveSpeedB = calculateSpeed(pointB, modeKey); // Speed at point B

    // Average the speed for the segment
    const averageSpeed = (effectiveSpeedA + effectiveSpeedB) / 2;

    if (averageSpeed <= 0) {
      console.warn("Calculated speed is zero or negative, skipping segment");
      continue;
    }

    // Calculate time for the segment
    const time = (distance / 1000 / averageSpeed) * 3600; // Convert to hours and back to seconds
    totalTime += time;
  }

  return Math.round(totalTime); // Round to nearest second
};

export default calculateTravelTime;
