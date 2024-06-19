import { TrackPoint } from "./types";
import haversineDistance from "./haversineDistance";

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
  
  const slopePercentage = (deltaElevation / distance) * 100;

  return parseFloat(slopePercentage.toFixed(2));
}

export default calculateSlope;
