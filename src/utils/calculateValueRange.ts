import { Track } from "./parseGPX";

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

  if (minValue === Infinity) minValue = defaultValue;
  if (maxValue === -Infinity) maxValue = defaultValue;

  return { minValue, maxValue };
}
