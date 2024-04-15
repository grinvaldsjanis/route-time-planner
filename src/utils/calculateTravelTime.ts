import travelModes from "../constants/travelModes";
import haversineDistance from "./haversineDistance";
import { Track, TrackPart } from "./parseGPX";

const calculateTravelTime = (
  trackParts: TrackPart[],
  tracks: Track[],
  modeKey: keyof typeof travelModes
): number[] => {
  const mode = travelModes[modeKey];
  return trackParts.map((trackPart) => {
    let totalTime = 0;

    trackPart.trackPoints.forEach(
      ({ trackIndex, segmentIndex, startIndex, endIndex }) => {
        if (!tracks[trackIndex] || !tracks[trackIndex].segments[segmentIndex]) {
          console.error(
            "Invalid track or segment index",
            trackIndex,
            segmentIndex
          );
          return; // Continue to the next iteration or handle this case appropriately
        }
        const segment = tracks[trackIndex].segments[segmentIndex];

        // Ensure the loop goes only up to the second to last point
        for (let i = startIndex; i < endIndex; i++) {
          const pointA = segment.points[i];
          const pointB = segment.points[i + 1];
          const distance = haversineDistance(
            parseFloat(pointA.lat),
            parseFloat(pointA.lon),
            parseFloat(pointB.lat),
            parseFloat(pointB.lon)
          );

          // Curve factor calculation
          const curveFactor = Math.log10((pointB.curve ?? 1000) / 10 + 1) / 3;

          // Slope impact adjustment within reasonable limits
          const slopeImpact = (pointB.slope ?? 0) / 100;
          const slopeAdjustmentFactor = Math.exp(
            -mode.powerFactor * slopeImpact
          );
          // Calculate effective speed ensuring it's within a realistic range
          let effectiveSpeed =
            mode.maxSpeed *
            (1 - mode.handlingFactor * curveFactor) *
            slopeAdjustmentFactor;

          // console.log("CurveRadius: ", pointA.curve, " Slope: ", pointA.slope, " EffSpeed: ", effectiveSpeed )

          const time = (distance / 1000 / effectiveSpeed) * 3600; // Convert to seconds
          totalTime += time;
        }
      }
    );

    return Math.round(totalTime);
  });
};

export default calculateTravelTime;
