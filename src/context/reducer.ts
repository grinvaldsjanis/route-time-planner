// src/context/reducer.ts
import { Action } from "./actions";
import { GPXData, Waypoint } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";

export interface GlobalState {
  stopTimes: unknown;
  gpxData: GPXData | null;
  mapMode: string;
  mapCenter: LatLngTuple;
  mapZoom: number;
  dataVersion: number;
  travelMode: string;
  waypoints?: Waypoint[];
}

export const initialState: GlobalState = {
  gpxData: JSON.parse(localStorage.getItem("gpxData") || "null"),
  mapMode: "elevation", // Default value or load from localStorage
  mapCenter: JSON.parse(localStorage.getItem("mapCenter") || '["0", "0"]'),
  mapZoom: JSON.parse(localStorage.getItem("mapZoom") || "13"),
  travelMode: localStorage.getItem("travelMode") || "Casual Walking",
  dataVersion: 0,
  stopTimes: undefined
};

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "SET_GPX_DATA":
      return {
        ...state,
        gpxData: action.payload,
        dataVersion: state.dataVersion + 1,
      };
    case "SET_MAP_MODE":
      return { ...state, mapMode: action.payload };
    case "SET_MAP_CENTER":
      return { ...state, mapCenter: action.payload };
    case "SET_MAP_ZOOM":
      return { ...state, mapZoom: action.payload };
    case "INCREMENT_DATA_VERSION":
      return { ...state, dataVersion: state.dataVersion + 1 };
    case "SET_TRAVEL_MODE":
      return { ...state, travelMode: action.payload };
    case "UPDATE_STOP_TIME":
      if (!state.gpxData || !state.gpxData.waypoints) return state;

      const updatedWaypoints = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, stopTime: action.payload.stopTime };
        }
        return waypoint;
      });

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
