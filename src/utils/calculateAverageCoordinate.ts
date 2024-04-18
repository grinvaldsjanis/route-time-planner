interface Coordinate {
  lat: number;
  lon: number;
}

export default function calculateAverageCoordinate(
  coordinates: Coordinate[]
): Coordinate | null {
  if (coordinates.length === 0) {
    return null;
  }

  const total = coordinates.reduce(
    (acc, coord) => {
      acc.lat += coord.lat;
      acc.lon += coord.lon;
      return acc;
    },
    { lat: 0, lon: 0 }
  );

  return {
    lat: total.lat / coordinates.length,
    lon: total.lon / coordinates.length,
  };
}
