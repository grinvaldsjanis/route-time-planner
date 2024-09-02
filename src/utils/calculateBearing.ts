import { LatLngTuple } from "leaflet";

/**
 * Calculates the bearing between two geographic points.
 * 
 * @param startPos - The starting position [latitude, longitude].
 * @param endPos - The ending position [latitude, longitude].
 * @returns The bearing in degrees from the start position to the end position.
 */
export const calculateBearing = (startPos: LatLngTuple, endPos: LatLngTuple): number => {
  const [lat1, lon1] = startPos;
  const [lat2, lon2] = endPos;

  const startLat = (lat1 * Math.PI) / 180;
  const startLon = (lon1 * Math.PI) / 180;
  const endLat = (lat2 * Math.PI) / 180;
  const endLon = (lon2 * Math.PI) / 180;

  const dLon = endLon - startLon;

  const y = Math.sin(dLon) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};