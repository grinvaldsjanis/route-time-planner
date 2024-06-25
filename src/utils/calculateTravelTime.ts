import travelModes from "../constants/travelModes";
import haversineDistance from "./haversineDistance";
import { Track, TrackPart } from "./types";

const calculateTravelTime = (
  trackParts: TrackPart[],
  tracks: Track[],
  modeKey: keyof typeof travelModes
): number[] => {
  const mode = travelModes[modeKey];

  if (!mode) {
    console.error("Invalid travel mode key:", modeKey);
    return [];
  }

  if (mode.powerFactor === undefined) {
    console.error("Power factor is missing for mode:", modeKey);
    return [];
  }

  return trackParts.map((trackPart) => {
    let totalTime = 0;

    trackPart.trackPoints.forEach(
      ({ trackIndex, startIndex, endIndex }) => {
        const track = tracks[trackIndex];
        if (!track) {
          console.error("Invalid track index", trackIndex);
          return;
        }
        const points = track.points;

        for (let i = startIndex; i < endIndex; i++) {
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
          const slopeAdjustmentFactor = Math.exp(
            -mode.powerFactor * slopeImpact
          );
          let effectiveSpeed =
            mode.maxSpeed *
            (1 - mode.handlingFactor * curveFactor) *
            slopeAdjustmentFactor;

          const time = (distance / 1000 / effectiveSpeed) * 3600;
          totalTime += time;
        }
      }
    );

    return Math.round(totalTime);
  });
};

export default calculateTravelTime;
