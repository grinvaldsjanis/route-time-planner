import { Action } from "./actions";
import { GPXData, Waypoint } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";
import { TravelMode } from "../constants/travelModes";
import calculateTravelTimes from "../utils/calculateTravelTimes";
import calculateAverageCoordinate from "../utils/calculateAverageCoordinate";

export interface GlobalState {
  stopTimes: unknown;
  gpxData: GPXData | null;
  mapMode: string;
  mapCenter: LatLngTuple;
  mapZoom: number;
  dataVersion: number;
  travelMode: TravelMode;
  waypoints?: Waypoint[];
}

export const initialState: GlobalState = {
  gpxData: JSON.parse(localStorage.getItem("gpxData") || "null"),
  mapMode: "elevation",
  mapCenter: JSON.parse(localStorage.getItem("mapCenter") || '["0", "0"]'),
  mapZoom: JSON.parse(localStorage.getItem("mapZoom") || "13"),
  travelMode: "Casual Walking" as TravelMode,
  dataVersion: 0,
  stopTimes: undefined,
};

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "INITIALIZE_STATE":
      return {
        ...state,
        ...action.payload,
      };
    case "SET_GPX_DATA":
      const updatedTrackParts = calculateTravelTimes(
        action.payload,
        state.travelMode
      );
      const updatedGPXData = {
        ...action.payload,
        trackParts: updatedTrackParts,
      };

      // Calculate the new map center
      const coordinates = updatedGPXData.waypoints.map((wp) => ({
        lat: parseFloat(wp.lat),
        lon: parseFloat(wp.lon),
      }));
      const averageCoord = calculateAverageCoordinate(coordinates);

      // Increment the data version
      const newDataVersion = state.dataVersion + 1;

      if (averageCoord) {
        localStorage.setItem("gpxData", JSON.stringify(updatedGPXData));
        localStorage.setItem(
          "mapCenter",
          JSON.stringify([averageCoord.lat, averageCoord.lon])
        );
        localStorage.setItem("dataVersion", JSON.stringify(newDataVersion));

        return {
          ...state,
          gpxData: updatedGPXData,
          mapCenter: [averageCoord.lat, averageCoord.lon],
          dataVersion: newDataVersion,
        };
      } else {
        // Handle the case where no average coordinate could be calculated
        console.error("Failed to calculate average coordinates for waypoints.");
        localStorage.setItem("gpxData", JSON.stringify(updatedGPXData));
        localStorage.setItem("dataVersion", JSON.stringify(newDataVersion));

        return {
          ...state,
          gpxData: updatedGPXData,
          dataVersion: newDataVersion,
        };
      }

    case "SET_MAP_MODE":
      localStorage.setItem("mapMode", action.payload);
      return { ...state, mapMode: action.payload };
    case "SET_MAP_CENTER":
      localStorage.setItem("mapCenter", JSON.stringify(action.payload));
      return { ...state, mapCenter: action.payload };
    case "SET_MAP_ZOOM":
      localStorage.setItem("mapZoom", JSON.stringify(action.payload));
      return { ...state, mapZoom: action.payload };
    case "INCREMENT_DATA_VERSION":
      const updatedDataVersion = state.dataVersion + 1;
      localStorage.setItem("dataVersion", JSON.stringify(updatedDataVersion));
      return { ...state, dataVersion: updatedDataVersion };
    case "SET_TRAVEL_MODE":
      localStorage.setItem("travelMode", JSON.stringify(action.payload));
      return { ...state, travelMode: action.payload };
    case "UPDATE_STOP_TIME":
      if (!state.gpxData || !state.gpxData.waypoints) return state;
      const updatedWaypoints = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, stopTime: action.payload.stopTime };
        }
        return waypoint;
      });
      localStorage.setItem(
        "gpxData",
        JSON.stringify({ ...state.gpxData, waypoints: updatedWaypoints })
      );
      return {
        ...state,
        gpxData: {
          ...state.gpxData,
          waypoints: updatedWaypoints,
        },
      };
    default:
      return state;
  }
};
