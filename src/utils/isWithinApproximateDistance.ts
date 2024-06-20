export default function isWithinApproximateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistanceKm: number
): boolean {
  const latDiff = Math.abs(lat1 - lat2) * 111; // Approximate km per degree latitude
  const lonDiff = Math.abs(lon1 - lon2) * 111; // Approximate km per degree longitude
  const distance = Math.sqrt(latDiff ** 2 + lonDiff ** 2); // Approximate distance in km
  return distance <= maxDistanceKm;
}
