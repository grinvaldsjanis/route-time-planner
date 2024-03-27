import calculateAngle from "./calculateAngle";
import { TrackPoint, TrackSegment } from "./parseGPX";

function interpolatePoints(
  p1: TrackPoint,
  p2: TrackPoint,
  distanceRatio: number
): TrackPoint {
  const latDiff = parseFloat(p2.lat) - parseFloat(p1.lat);
  const lonDiff = parseFloat(p2.lon) - parseFloat(p1.lon);
  const interpolatedLat = parseFloat(p1.lat) + distanceRatio * latDiff;
  const interpolatedLon = parseFloat(p1.lon) + distanceRatio * lonDiff;
  const eleDiff = (p2.ele ?? 0) - (p1.ele ?? 0);
  const interpolatedEle = (p1.ele ?? 0) + distanceRatio * eleDiff;

  return {
    ...p1,
    lat: interpolatedLat.toString(),
    lon: interpolatedLon.toString(),
    ele: interpolatedEle,
  };
}

function addInterpolatedPoints(
  segment: TrackSegment,
  distances: Record<number, number>
): TrackSegment {
  const newPoints: TrackPoint[] = [];

  segment.points.forEach((point, i) => {
    if (i > 0 && i < segment.points.length - 1) {
      const prevPoint = segment.points[i - 1];
      const nextPoint = segment.points[i + 1];

      const angle = calculateAngle(
        [parseFloat(prevPoint.lat), parseFloat(prevPoint.lon)],
        [parseFloat(point.lat), parseFloat(point.lon)],
        [parseFloat(nextPoint.lat), parseFloat(nextPoint.lon)]
      );

      let distance = 0;
      Object.keys(distances).forEach((angleThresholdStr) => {
        const angleThreshold = parseFloat(angleThresholdStr);
        if (angle <= angleThreshold) {
          distance = distances[angleThreshold];
        }
      });

      if (distance > 0) {
        const distanceRatioBefore =
          distance / calculateDistance(prevPoint, point);
        const distanceRatioAfter =
          distance / calculateDistance(point, nextPoint);

        if (distanceRatioBefore <= 1) {
          const interpolatedBefore = interpolatePoints(
            prevPoint,
            point,
            distanceRatioBefore
          );
          newPoints.push(interpolatedBefore);
        }

        newPoints.push(point);

        if (distanceRatioAfter <= 1) {
          const interpolatedAfter = interpolatePoints(
            point,
            nextPoint,
            distanceRatioAfter
          );
          newPoints.push(interpolatedAfter);
        }
      } else {
        newPoints.push(point);
      }
    } else {
      newPoints.push(point);
    }
  });

  return { ...segment, points: newPoints };
}

export function preprocessTrackSegments(
  segments: TrackSegment[]
): TrackSegment[] {
  const distances: Record<number, number> = {
    90: 10,
    120: 30,
    160: 60,
  };

  return segments.map((segment) => addInterpolatedPoints(segment, distances));
}

function calculateDistance(p1: TrackPoint, p2: TrackPoint): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = parseFloat(p1.lat) * Math.PI / 180; // Convert degrees to radians
  const lat2 = parseFloat(p2.lat) * Math.PI / 180;
  const deltaLat = (parseFloat(p2.lat) - parseFloat(p1.lat)) * Math.PI / 180;
  const deltaLon = (parseFloat(p2.lon) - parseFloat(p1.lon)) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

