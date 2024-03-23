export default function getColorForElevation(elevation: number, minElevation: number, maxElevation: number) {
    const ratio = (elevation - minElevation) / (maxElevation - minElevation);
    return `hsl(${180 - ratio * 160}, 100%, 50%)`;
  }
  