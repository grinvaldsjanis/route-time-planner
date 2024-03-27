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
  let minValue = Infinity; // Start with the highest possible number
  let maxValue = -Infinity; // Start with the lowest possible number

  tracks.forEach((track) =>
    track.segments.forEach((segment) =>
      segment.points.forEach((point) => {
        let sampleValue = defaultValue; // Default sample value

        switch (mode) {
          case "curvature":
            sampleValue = point.curve ?? defaultValue;
            break;
          case "elevation":
            sampleValue = point.ele ?? defaultValue;
            break;
          case "slope":
            // Assuming point.slope exists, or you calculate it somehow
            sampleValue = point.slope ?? defaultValue;
            break;
          default:
            // If mode is not recognized, use the default value
            sampleValue = defaultValue;
        }

        // Update min and max values based on the sample value
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
