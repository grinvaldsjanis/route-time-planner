import axios from "axios";

interface Coordinate {
  lat: number;
  lon: number;
}

interface ElevationResult {
  elevation: number | null;
  location: { lat: number; lon: number };
}

export async function fetchElevationData(
  coordinates: Coordinate[]
): Promise<(number | null)[]> {
  const locations = coordinates.map((coord) => ({
    latitude: coord.lat,
    longitude: coord.lon,
  }));
  const url = `https://api.open-elevation.com/api/v1/lookup`;

  try {
    const response = await axios.post(url, { locations }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const elevations = response.data.results.map((result: ElevationResult) => result.elevation);

    // Log elevations for debugging
    // console.log("Fetched Elevations:", elevations);

    // Ensure elevations are valid
    return elevations.map((elevation: number | null) => elevation !== null ? elevation : 0);
  } catch (error) {
    console.error("Error fetching elevation data:", error);
    return coordinates.map(() => 0); // Return 0 if there is an error
  }
}
