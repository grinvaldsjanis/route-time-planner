import { TrackPoint } from "./parseGPX";

export default function calculateCurveRadius(
  p1: TrackPoint,
  p2: TrackPoint,
  p3: TrackPoint
): number {
  // Function to calculate distance between two points using Haversine formula
  function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = (lat1 * Math.PI) / 180; // Convert latitude to radians
    const φ2 = (lat2 * Math.PI) / 180; // Convert latitude to radians
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Extract latitude and longitude from TrackPoint and convert them to numbers
  const latA = parseFloat(p1.lat);
  const lonA = parseFloat(p1.lon);
  const latB = parseFloat(p2.lat);
  const lonB = parseFloat(p2.lon);
  const latC = parseFloat(p3.lat);
  const lonC = parseFloat(p3.lon);

  // Calculate distances between the points
  const a = haversineDistance(latA, lonA, latB, lonB);
  const b = haversineDistance(latB, lonB, latC, lonC);
  const c = haversineDistance(latC, lonC, latA, lonA);

  const s = (a + b + c) / 2; // Semiperimeter for the triangle
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c)); // Area of the triangle using Heron's formula

  // Radius of the circumcircle
  let radius = (a * b * c) / (4 * area);
  if (radius > 10000) {
    radius = 10000;
  }
  return radius;
}
