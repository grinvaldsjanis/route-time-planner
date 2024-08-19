import { Track, TrackPart } from "./types";
import haversineDistance from "./haversineDistance";
import travelModes from "../constants/travelModes";

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

  if (mode.powerFactor === undefined) {
    console.error("Power factor is missing for mode:", modeKey);
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

    const curveFactor = Math.log10((pointB.curve ?? 1000) / 10 + 1) / 3;

    const slopeImpact = (pointB.slope ?? 0) / 100;
    const slopeAdjustmentFactor = Math.exp(-mode.powerFactor * slopeImpact);
    let effectiveSpeed =
      mode.maxSpeed *
      (1 - mode.handlingFactor * curveFactor) *
      slopeAdjustmentFactor;

    const time = (distance / 1000 / effectiveSpeed) * 3600;
    totalTime += time;
  }

  return Math.round(totalTime);
};

export default calculateTravelTime;
