import axios from "axios";
import { Coordinate } from "./types";

interface SpeedLimitResult {
  speedLimit: number | null;
}

// Function to check if coordinates are within the bounding box of Latvia
function isWithinLatviaBounds(lat: number, lon: number): boolean {
  const north = 58.08;
  const south = 55.67;
  const east = 28.24;
  const west = 20.97;

  return lat >= south && lat <= north && lon >= west && lon <= east;
}

// Function to split an array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function fetchSpeedLimitData(
  coordinates: Coordinate[]
): Promise<SpeedLimitResult[]> {
  // Filter coordinates to only include those within Latvia's boundaries
  const validCoordinates = coordinates.filter((coord) =>
    isWithinLatviaBounds(coord.lat, coord.lon)
  );

  if (validCoordinates.length === 0) {
    console.log(
      "All coordinates are outside Latvia's boundaries. Skipping fetch."
    );
    return coordinates.map(() => ({ speedLimit: null }));
  }

  try {
    const chunkSize = 50; // Adjust this number based on API limits and performance considerations
    const coordChunks = chunkArray(validCoordinates, chunkSize);
    const allResults: any[] = [];

    // Fetch data for each chunk sequentially or in parallel
    for (const chunk of coordChunks) {
      const coordArray = chunk
        .map((coord) => `[${coord.lon.toFixed(6)},${coord.lat.toFixed(6)}]`)
        .join(",");

      const url = `https://api.kartes.lv/v3/KVDM_4c6k2/speed_limit?p=[${coordArray}]&wgs84`;

      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        });

        allResults.push(...response.data);
      } catch (error) {
        console.error("Error fetching chunk data:", error);
      }
    }

    // Map results back to the original set of coordinates, returning null for out-of-bound coordinates
    return coordinates.map((coord) => {
      if (isWithinLatviaBounds(coord.lat, coord.lon)) {
        const resultSet = allResults.find((res: any) =>
          res.some(
            (entry: any) =>
              parseFloat(entry.lon).toFixed(6) === coord.lon.toFixed(6) &&
              parseFloat(entry.lat).toFixed(6) === coord.lat.toFixed(6)
          )
        );
        const primaryResult = resultSet ? resultSet[0] : {};
        return {
          speedLimit: primaryResult.speed_limit
            ? parseInt(primaryResult.speed_limit, 10)
            : null,
        };
      } else {
        return { speedLimit: null };
      }
    });
  } catch (error) {
    console.error("Error fetching speed limit data:", error);
    return coordinates.map(() => ({ speedLimit: null }));
  }
}
