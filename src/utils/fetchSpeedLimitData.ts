import axios from "axios";
import { Coordinate } from "./types";

const API_KEY = "KVDM_YU0yy";
const RETRY_DELAY = 500;
const MAX_RETRIES = 3;

interface SpeedLimitResult {
  speedLimit: number | null;
}

function isWithinLatviaBounds(lat: number, lon: number): boolean {
  const north = 58.08;
  const south = 55.67;
  const east = 28.24;
  const west = 20.97;
  return lat >= south && lat <= north && lon >= west && lon <= east;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function constructUrl(coords: string): string {
  return `https://api.kartes.lv/v3/${API_KEY}/speed_limit?p=[${coords}]&wgs84`;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchChunkWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<any[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
        timeout: 500,
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }

      console.warn("Empty response detected, retrying...");
    } catch (error) {
      console.error("Error fetching chunk data, retrying:", error);
    }

    await delay(RETRY_DELAY * (attempt + 1));
  }

  console.error("Failed to retrieve data after maximum retries.");
  return [];
}

export async function fetchSpeedLimitData(
  coordinates: Coordinate[]
): Promise<SpeedLimitResult[]> {
  const validCoordinates = coordinates.filter((coord) =>
    isWithinLatviaBounds(coord.lat, coord.lon)
  );

  if (validCoordinates.length === 0) {
    console.log(
      "All coordinates are outside Latvia's boundaries. Skipping fetch."
    );
    return coordinates.map(() => ({ speedLimit: null }));
  }

  const chunkSize = 50;
  const coordChunks = chunkArray(validCoordinates, chunkSize);
  const allResults: any[] = [];

  for (const chunk of coordChunks) {
    const coordArray = chunk
      .map((coord) => `[${coord.lon.toFixed(6)},${coord.lat.toFixed(6)}]`)
      .join(",");
    const url = constructUrl(coordArray);

    const chunkResults = await fetchChunkWithRetry(url);

    if (chunkResults.length > 0) {
      allResults.push(...chunkResults);
    } else {
      console.warn("No valid data received for this chunk.");
    }

    await delay(RETRY_DELAY);
  }

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
}
