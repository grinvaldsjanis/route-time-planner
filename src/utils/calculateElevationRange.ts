import { Track } from "./parseGPX";

export function calculateElevationRange(tracks: Track[]): { minElevation: number; maxElevation: number } {
    let minElevation = Infinity;
    let maxElevation = -Infinity;
    tracks.forEach((track) =>
      track.segments.forEach((segment) =>
        segment.points.forEach((point) => {
          const elevation = parseFloat(point.ele || "0");
          if (!isNaN(elevation)) {
            minElevation = Math.min(minElevation, elevation);
            maxElevation = Math.max(maxElevation, elevation);
          }
        })
      )
    );
    return { minElevation, maxElevation };
}
