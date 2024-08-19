// preprocessTrackPoints.ts
import calculateAngle from "./calculateAngle";
import haversineDistance from "./haversineDistance";
import { TrackPoint, Track } from "./types";

export function interpolatePoints(
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
  const roundedInterpolatedEle = Math.round(interpolatedEle * 100) / 100;

  return {
    ...p1,
    lat: interpolatedLat.toFixed(6),
    lon: interpolatedLon.toFixed(6),
    ele: roundedInterpolatedEle,
  };
}

function addInterpolatedPoints(
  points: TrackPoint[],
  distances: Record<number, number>
): TrackPoint[] {
  const newPoints: TrackPoint[] = [];

  points.forEach((point: TrackPoint, i: number) => {
    if (i > 0 && i < points.length - 1) {
      const prevPoint = points[i - 1];
      const nextPoint = points[i + 1];

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
          distance /
          haversineDistance(
            parseFloat(prevPoint.lat),
            parseFloat(prevPoint.lon),
            parseFloat(point.lat),
            parseFloat(point.lon)
          );
        const distanceRatioAfter =
          distance /
          haversineDistance(
            parseFloat(point.lat),
            parseFloat(point.lon),
            parseFloat(nextPoint.lat),
            parseFloat(nextPoint.lon)
          );

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

  return newPoints;
}

export function preprocessTrackPoints(
  tracks: Track[]
): Track[] {
  const distances: Record<number, number> = {
    90: 10,
    120: 30,
    160: 60,
  };

  return tracks.map((track) => ({
    ...track,
    points: addInterpolatedPoints(track.points, distances),
  }));
}
