import { LatLngTuple } from "leaflet";
import { TrackPoint } from "./types";

// Function to calculate bounds from track points with sampling logic
export const calculateBoundsFromTrack = (
  points: TrackPoint[]
): [LatLngTuple, LatLngTuple] | null => {
  if (!points.length) return null;

  // Determine the number of samples
  const sampleCount = points.length >= 500 ? 50 : Math.ceil(points.length / 20);
  const sampleInterval = Math.ceil(points.length / sampleCount);

  // Sample points at the calculated interval
  const sampledPoints = points.filter(
    (_, index) => index % sampleInterval === 0
  );

  // Initialize min/max values based on the first sampled point
  let minLat = parseFloat(sampledPoints[0].lat);
  let maxLat = minLat;
  let minLon = parseFloat(sampledPoints[0].lon);
  let maxLon = minLon;

  // Update bounds based on each sampled point
  sampledPoints.forEach(({ lat, lon }) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (latitude < minLat) minLat = latitude;
    if (latitude > maxLat) maxLat = latitude;
    if (longitude < minLon) minLon = longitude;
    if (longitude > maxLon) maxLon = longitude;
  });

  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ] as [LatLngTuple, LatLngTuple];
};
