import { Action } from "./actions";
import { GPXData, Waypoint } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";
import travelModes, { TravelMode } from "../constants/travelModes";
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
  startTime: string;
  focusedWaypointIndex: number | null;
}

const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const initialState: GlobalState = {
  gpxData: getLocalStorage("gpxData", null),
  mapMode: getLocalStorage("mapMode", "elevation"),
  mapCenter: getLocalStorage("mapCenter", [0, 0]),
  mapZoom: getLocalStorage("mapZoom", 13),
  travelMode: getLocalStorage("travelMode", "Casual Walking"),
  dataVersion: getLocalStorage("dataVersion", 0),
  startTime: getLocalStorage("startTime", "08:00:00"),
  stopTimes: undefined,
  focusedWaypointIndex: null,
};

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "INITIALIZE_STATE":
      return {
        ...state,
        ...action.payload,
      };
    case "CLEAR_PREVIOUS_DATA":
      localStorage.removeItem("gpxData");
      localStorage.removeItem("dataVersion");
      localStorage.removeItem("stopTimes");

      return {
        ...initialState,
        mapMode: state.mapMode,
        travelMode: state.travelMode,
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

      const averageCoord = calculateAverageCoordinate(
        updatedGPXData.waypoints.map((wp) => ({
          lat: parseFloat(wp.lat),
          lon: parseFloat(wp.lon),
        }))
      );

      setLocalStorage("gpxData", updatedGPXData);
      setLocalStorage("dataVersion", 0);
      if (averageCoord) {
        setLocalStorage("mapCenter", [averageCoord.lat, averageCoord.lon]);
      }

      return {
        ...state,
        gpxData: updatedGPXData,
        mapCenter: averageCoord
          ? [averageCoord.lat, averageCoord.lon]
          : state.mapCenter,
        dataVersion: 0,
        stopTimes: undefined,
      };
    case "SET_MAP_MODE":
      localStorage.setItem("mapMode", action.payload);
      return { ...state, mapMode: action.payload };

    case "SET_MAP_CENTER":
      localStorage.setItem("mapCenter", JSON.stringify(action.payload));
      return { ...state, mapCenter: action.payload };

    case "SET_MAP_ZOOM":
      localStorage.setItem("mapZoom", JSON.stringify(action.payload));
      return { ...state, mapZoom: action.payload };
    case "SET_TRAVEL_MODE":
      if (typeof action.payload === "string" && action.payload in travelModes) {
        if (state.gpxData) {
          const updatedTrackParts = calculateTravelTimes(
            state.gpxData,
            action.payload as TravelMode
          );
          const updatedGPXData = {
            ...state.gpxData,
            trackParts: updatedTrackParts,
          };
          localStorage.setItem("travelMode", JSON.stringify(action.payload));
          localStorage.setItem("gpxData", JSON.stringify(updatedGPXData));
          return {
            ...state,
            travelMode: action.payload as TravelMode,
            gpxData: updatedGPXData,
          };
        }
        localStorage.setItem("travelMode", JSON.stringify(action.payload));
        return { ...state, travelMode: action.payload as TravelMode };
      }
      return state;
    case "INCREMENT_DATA_VERSION":
      const updatedDataVersion = state.dataVersion + 1;
      setLocalStorage("dataVersion", updatedDataVersion);
      return { ...state, dataVersion: updatedDataVersion };
    case "SET_START_TIME":
      localStorage.setItem("startTime", action.payload);
      return { ...state, startTime: action.payload };

    case "UPDATE_STOP_TIME":
      if (!state.gpxData || !state.gpxData.waypoints) return state;
      const updatedWaypoints = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, stopTime: action.payload.stopTime };
        }
        return waypoint;
      });
      const updatedGPXDataWithStops = {
        ...state.gpxData,
        waypoints: updatedWaypoints,
      };
      setLocalStorage("gpxData", updatedGPXDataWithStops);
      return {
        ...state,
        gpxData: updatedGPXDataWithStops,
      };
    case "SET_WAYPOINT_NAME": {
      if (!state.gpxData) {
        console.error("No GPX data available to update waypoint name.");
        return state;
      }

      const updatedWaypoints = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, name: action.payload.name };
        }
        return waypoint;
      });

      return {
        ...state,
        gpxData: { ...state.gpxData, waypoints: updatedWaypoints },
      };
    };
    case "SET_FOCUSED_WAYPOINT":
  return {
    ...state,
    focusedWaypointIndex: action.payload,
  };
    // Add other cases as necessary
    default:
      return state;
  }
};
