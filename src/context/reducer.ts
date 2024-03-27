// src/context/reducer.ts
import { Action } from "./actions";
import { GPXData } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";

export interface GlobalState {
  gpxData: GPXData | null;
  mapMode: string;
  mapCenter: LatLngTuple;
  mapZoom: number;
}

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error parsing ${key} from localStorage:`, e);
    }
  }
  return defaultValue;
}

export const initialState: GlobalState = {
    gpxData: JSON.parse(localStorage.getItem("gpxData") || "null"),
    mapMode: "elevation", // Default value or load from localStorage
    mapCenter: JSON.parse(localStorage.getItem("mapCenter") || '["0", "0"]'),
    mapZoom: JSON.parse(localStorage.getItem("mapZoom") || "13"),
};

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "SET_GPX_DATA":
      return { ...state, gpxData: action.payload };
    case "SET_MAP_MODE":
      return { ...state, mapMode: action.payload };
    case "SET_MAP_CENTER":
      return { ...state, mapCenter: action.payload };
    case "SET_MAP_ZOOM":
      return { ...state, mapZoom: action.payload };
    default:
      return state;
  }
};
