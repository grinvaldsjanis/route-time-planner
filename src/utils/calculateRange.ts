import { Track } from "./parseGPX";

export function calculateElevationRange(tracks: Track[]): { minElevation: number; maxElevation: number } {
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  tracks.forEach(track =>
    track.segments.forEach(segment =>
      segment.points.forEach(point => {
        const elevation = point.ele ?? 0; // Ensure elevation is a number
        minElevation = Math.min(minElevation, elevation);
        maxElevation = Math.max(maxElevation, elevation);
      })
    )
  );
  return { minElevation, maxElevation };
}

export function calculateCurvatureRange(tracks: Track[]): { minCurve: number; maxCurve: number } {
  let minCurve = Infinity;
  let maxCurve = -Infinity;
  tracks.forEach(track =>
    track.segments.forEach(segment =>
      segment.points.forEach(point => {
        const curvature = point.curve ?? 10000; // Assume 10000 as a default or maximum curve radius
        minCurve = Math.min(minCurve, curvature);
        maxCurve = Math.max(maxCurve, curvature);
      })
    )
  );
  return { minCurve, maxCurve };
}
