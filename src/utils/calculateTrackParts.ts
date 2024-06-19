import travelModes from "../constants/travelModes";
import haversineDistance from "./haversineDistance";
import { Track, TrackPart, TrackPoint, Waypoint } from "./types";

const calculateTrackParts = (
  waypoints: Waypoint[],
  tracks: Track[],
  modeKey: keyof typeof travelModes
): TrackPart[] => {
  const trackParts: TrackPart[] = [];

  const calculateTotalDistance = (
    points: TrackPoint[],
    startIndex: number,
    endIndex: number
  ): number => {
    let totalDistance = 0;
    for (let i = startIndex; i < endIndex; i++) {
      totalDistance += haversineDistance(
        parseFloat(points[i].lat),
        parseFloat(points[i].lon),
        parseFloat(points[i + 1].lat),
        parseFloat(points[i + 1].lon)
      );
    }
    return totalDistance / 1000;
  };

  const mode = travelModes[modeKey];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    const tp1 = wp1.closestTrackpoint;
    const tp2 = wp2.closestTrackpoint;

    if (tp1 && tp2 && tp1.trackIndex === tp2.trackIndex) {
      const track = tracks[tp1.trackIndex];
      const segment = track.segments[tp1.segmentIndex];
      const points = segment.points;
      const distance = calculateTotalDistance(points, tp1.pointIndex, tp2.pointIndex);

      let totalTime = 0;
      let lastPoint = points[tp1.pointIndex];

      for (let j = tp1.pointIndex + 1; j <= tp2.pointIndex; j++) {
        const currentPoint = points[j];
        const segmentDistance = haversineDistance(
          parseFloat(lastPoint.lat), parseFloat(lastPoint.lon),
          parseFloat(currentPoint.lat), parseFloat(currentPoint.lon)
        );

        const curveFactor = 1 - Math.min((currentPoint.curve ?? 1000) / 1000, 1);
        const slopeImpact = Math.max(0, -(currentPoint.slope ?? 0) / 100);
        const slopeFactor = mode.powerFactor * slopeImpact;
        const effectiveSpeed = mode.maxSpeed * (1 - mode.handlingFactor * curveFactor) * (1 - slopeFactor);
        const time = (segmentDistance / 1000) / effectiveSpeed * 3600; 

        totalTime += time;
        lastPoint = currentPoint;
      }

      trackParts.push({
        waypoints: [i, i + 1],
        trackPoints: [{
          trackIndex: tp1.trackIndex,
          segmentIndex: tp1.segmentIndex,
          startIndex: tp1.pointIndex,
          endIndex: tp2.pointIndex
        }],
        distance: distance,
        travelTime: 0,
        durationMultiplier: 1,
      });
    }
  }

  return trackParts;
};

export default calculateTrackParts;