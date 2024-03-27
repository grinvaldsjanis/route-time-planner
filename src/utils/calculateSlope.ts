import { TrackPoint } from "./parseGPX";

function calculateSlope(p1: TrackPoint, p2: TrackPoint): number {
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const distance = haversineDistance(
    parseFloat(p1.lat),
    parseFloat(p1.lon),
    parseFloat(p2.lat),
    parseFloat(p2.lon)
  );

  const deltaElevation = (p2.ele ?? 0) - (p1.ele ?? 0);

  // Calculate slope in radians
  const slopeRadians = Math.asin(deltaElevation / distance);

  // Optionally, convert slope to degrees or percentage
  // const slopeDegrees = slopeRadians * (180 / Math.PI);
  const slopePercentage = Math.tan(slopeRadians) * 100;

  return slopePercentage;
}

export default calculateSlope;
