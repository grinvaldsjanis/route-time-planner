export default function isWithinApproximateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  const maxDistanceKm = 5;
  return (
    Math.abs(lat1 - lat2) * 111 <= maxDistanceKm &&
    Math.abs(lon1 - lon2) * 111 <= maxDistanceKm
  );
}
