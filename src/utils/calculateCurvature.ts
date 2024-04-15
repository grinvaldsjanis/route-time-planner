import { TrackPoint } from "./parseGPX";

export default function calculateCurveRadius(
  p1: TrackPoint,
  p2: TrackPoint,
  p3: TrackPoint
): number {
  // Haversine formula function remains unchanged
  function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const a = haversineDistance(
    parseFloat(p1.lat),
    parseFloat(p1.lon),
    parseFloat(p2.lat),
    parseFloat(p2.lon)
  );
  const b = haversineDistance(
    parseFloat(p2.lat),
    parseFloat(p2.lon),
    parseFloat(p3.lat),
    parseFloat(p3.lon)
  );
  const c = haversineDistance(
    parseFloat(p3.lat),
    parseFloat(p3.lon),
    parseFloat(p1.lat),
    parseFloat(p1.lon)
  );

  const s = (a + b + c) / 2; // Semiperimeter
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  let radius = (a * b * c) / (4 * area); // Radius of circumscribed circle

  if (area === 0 || !isFinite(radius)) {
    // Check if the area is zero or radius is not finite, replace with fallback value
    radius = 1000;
  } else {
    // Cap the radius at 1000 if the calculated value exceeds this limit
    radius = Math.min(radius, 1000);
  }

  // Ensure the radius is rounded and positive
  radius = Math.abs(Math.round(radius));

  return radius;
}
