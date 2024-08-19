import { Track, TrackPoint } from "./types";

export function calculateValueRange(
  tracks: Track[],
  mode: string,
  defaultValue: number
): { minValue: number; maxValue: number } {
  let minValue = Infinity;
  let maxValue = -Infinity;

  if (!tracks || tracks.length === 0) {
    return { minValue: defaultValue, maxValue: defaultValue };
  }

  tracks.forEach((track) => {
    // Additional safeguard: Check if the track exists and has points
    if (!track || !track.points || track.points.length === 0) {
      console.warn("Track or track points are missing or empty:", track);
      return;
    }

    track.points.forEach((point: TrackPoint) => {
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
    });
  });

  // If no valid points are found, return default values
  if (minValue === Infinity) minValue = defaultValue;
  if (maxValue === -Infinity) maxValue = defaultValue;

  return { minValue, maxValue };
}
