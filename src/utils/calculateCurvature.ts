import haversineDistance from "./haversineDistance";
import { TrackPoint } from "./types";

export default function calculateCurveRadius(
  p1: TrackPoint,
  p2: TrackPoint,
  p3: TrackPoint
): number {

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

  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  let radius = (a * b * c) / (4 * area);

  if (area === 0 || !isFinite(radius)) {
    radius = 1000;
  } else {
    radius = Math.min(radius, 1000);
  }

  radius = Math.abs(Math.round(radius));

  return radius;
}
