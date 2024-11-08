import axios from "axios";
import { Coordinate } from "./types";
import proj4 from "proj4"; // Ensure proj4 is installed and imported

// Define the projection for Web Mercator (EPSG:3857)
proj4.defs(
  "EPSG:3857",
  "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);

// WGS-84 definition (this is often built-in, but adding for clarity)
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

interface RoadDetailResult {
  surface: string | null;
  roadCategory: string | null;
}

// Function to check if coordinates are within the bounding box of Latvia
function isWithinLatviaBounds(lat: number, lon: number): boolean {
  const north = 58.08;
  const south = 55.67;
  const east = 28.24;
  const west = 20.97;

  return lat >= south && lat <= north && lon >= west && lon <= east;
}

export async function fetchRoadDetailData(
  coordinate: Coordinate
): Promise<RoadDetailResult> {
  const { lat, lon } = coordinate;

  // Check if the coordinates are within Latvia's boundaries
  if (!isWithinLatviaBounds(lat, lon)) {
    console.log("Coordinates are outside Latvia's boundaries. Skipping fetch.");
    return {
      surface: null,
      roadCategory: null,
    };
  }

  try {
    const [x, y] = proj4("EPSG:4326", "EPSG:3857", [lon, lat]);
    const url = `https://api.kartes.lv/v3/KVDM_4c6k2/roaddetail?x=${x}&y=${y}`;
    const response = await axios.get(url);
  
    console.log("API response data:", response.data);
  
    if (response.data && response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0].properties;
      return {
        surface: feature.segums || null,
        roadCategory: feature.klase_v || null,
      };
    } else if (response.data.error) {
      console.error("API returned an error:", response.data.error);
      return {
        surface: null,
        roadCategory: null,
      };
    } else {
      console.log("No features found in the response data.");
      return {
        surface: null,
        roadCategory: null,
      };
    }
  } catch (error) {
    console.error("Error fetching road detail data:", error, error);
    return {
      surface: null,
      roadCategory: null,
    };
  }
  
}
