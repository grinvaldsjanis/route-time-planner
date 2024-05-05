import haversineDistance from "./haversineDistance";
import { TrackPoint } from "./parseGPX";

function calculateSlope(p1: TrackPoint, p2: TrackPoint): number {

  const distance = haversineDistance(
    parseFloat(p1.lat),
    parseFloat(p1.lon),
    parseFloat(p2.lat),
    parseFloat(p2.lon)
  );

  if (distance === 0) {
    return 0;
  }

  const deltaElevation = (p2.ele ?? 0) - (p1.ele ?? 0);

  const slopeRadians = Math.asin(deltaElevation / distance);

  let slopePercentage = Math.tan(slopeRadians) * 100;

  slopePercentage = isNaN(slopePercentage) ? 0 : parseFloat(slopePercentage.toFixed(1));

  return slopePercentage;
}

export default calculateSlope;
