import haversineDistance from "./haversineDistance";
import { Track, TrackPart, TrackPoint, Waypoint } from "./types";

const calculateTrackParts = (
  waypoints: Waypoint[],
  tracks: Track[],
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