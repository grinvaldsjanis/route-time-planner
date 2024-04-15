import { Track } from "./parseGPX";

export function calculateElevationRange(tracks: Track[]): {
  minElevation: number;
  maxElevation: number;
} {
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  tracks.forEach((track) =>
    track.segments.forEach((segment) =>
      segment.points.forEach((point) => {
        const elevation = point.ele ?? 0;
        minElevation = Math.min(minElevation, elevation);
        maxElevation = Math.max(maxElevation, elevation);
      })
    )
  );
  return { minElevation, maxElevation };
}

export function calculateCurvatureRange(tracks: Track[]): {
  minCurve: number;
  maxCurve: number;
} {
  let minCurve = Infinity;
  let maxCurve = -Infinity;
  tracks.forEach((track) =>
    track.segments.forEach((segment) =>
      segment.points.forEach((point) => {
        const curvature = point.curve ?? 1000;
        minCurve = Math.min(minCurve, curvature);
        maxCurve = Math.max(maxCurve, curvature);
      })
    )
  );
  return { minCurve, maxCurve };
}

export function calculateValueRange(
  tracks: Track[],
  mode: string,
  defaultValue: number
): { minValue: number; maxValue: number } {
  let minValue = Infinity;
  let maxValue = -Infinity;

  tracks.forEach((track) =>
    track.segments.forEach((segment) =>
      segment.points.forEach((point) => {
        let sampleValue = defaultValue;

        switch (mode) {
          case "curve":
            sampleValue = point.curve ?? defaultValue;

            break;
          case "ele":
            sampleValue = point.ele ?? defaultValue;
            break;
          case "slope":
            sampleValue = point.slope ?? defaultValue;
            break;
          default:
            sampleValue = defaultValue;
        }

        minValue = Math.min(minValue, sampleValue);
        maxValue = Math.max(maxValue, sampleValue);


      })
    )
  );

  // Check if minValue or maxValue have not been updated, set them to 0 or the defaultValue
  if (minValue === Infinity) minValue = defaultValue;
  if (maxValue === -Infinity) maxValue = defaultValue;

  return { minValue, maxValue };
}
