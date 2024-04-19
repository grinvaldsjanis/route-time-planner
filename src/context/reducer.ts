// src/context/reducer.ts
import { Action } from "./actions";
import { GPXData, Waypoint } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";
import { TravelMode } from "../constants/travelModes";
import calculateTravelTimes from "../utils/calculateTravelTimes";
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
  mapMode: "elevation", // Default value or load from localStorage
  mapCenter: JSON.parse(localStorage.getItem("mapCenter") || '["0", "0"]'),
  mapZoom: JSON.parse(localStorage.getItem("mapZoom") || "13"),
  travelMode: "Casual Walking" as TravelMode,
  dataVersion: 0,
  stopTimes: undefined,
};

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "SET_GPX_DATA":
      localStorage.setItem("gpxData", JSON.stringify(action.payload));
      return {
        ...state,
        gpxData: action.payload,
        dataVersion: state.dataVersion + 1,
      };
    case "SET_MAP_MODE":
      localStorage.setItem("mapMode", action.payload); // Persist map mode
      return { ...state, mapMode: action.payload };
    case "SET_MAP_CENTER":
      localStorage.setItem("mapCenter", JSON.stringify(action.payload)); // Persist map center
      return { ...state, mapCenter: action.payload };
    case "SET_MAP_ZOOM":
      localStorage.setItem("mapZoom", JSON.stringify(action.payload)); // Persist map zoom
      return { ...state, mapZoom: action.payload };
    case "INCREMENT_DATA_VERSION":
      return { ...state, dataVersion: state.dataVersion + 1 };
    case "SET_TRAVEL_MODE":
      case "SET_TRAVEL_MODE":
        if (state.gpxData) {
          // Recalculate travel times with the new travel mode
          const updatedTrackParts = calculateTravelTimes(state.gpxData, action.payload);
          const updatedGPXData = {...state.gpxData, trackParts: updatedTrackParts};
          localStorage.setItem("travelMode", action.payload); // Persist new travel mode
          localStorage.setItem("gpxData", JSON.stringify(updatedGPXData)); // Persist updated GPX data
          return {
            ...state,
            travelMode: action.payload,
            gpxData: updatedGPXData,
          };
        }
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
