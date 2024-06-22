// src/reducer.ts
import { Action } from "./actions";
import { LatLngTuple } from "leaflet";
import travelModes, { TravelMode } from "../constants/travelModes";
import calculateTravelTimes from "../utils/calculateTravelTimes";
import calculateAverageCoordinate from "../utils/calculateAverageCoordinate";
import calculateWaypointStatistics from "../utils/calculateWaypointStatistics";
import calculateRelativeTimes from "../utils/calculateRelativeTimes";
import { GPXData } from "../utils/types";
import { getLocalStorage, setLocalStorage, removeLocalStorage } from "../utils/localStorageUtils";

export interface GlobalState {
  gpxData: GPXData | null;
  mapMode: "ele" | "curve" | "slope";
  mapCenter: LatLngTuple;
  mapZoom: number;
  dataVersion: number;
  travelMode: TravelMode;
  totalDistance: number;
  totalTravelTime: number;
  totalJourneyTime: string;
  finalArrivalTime: string;
  focusedWaypointIndex: number | null;
  startTime: string;
  isProgrammaticMove: boolean;
  inProgress: boolean;
  progressText: string;
}

export const initialState: GlobalState = {
  dataVersion: getLocalStorage("dataVersion", 0),
  gpxData: getLocalStorage("gpxData", null),
  mapMode: getLocalStorage("mapMode", "ele"),
  mapCenter: getLocalStorage("mapCenter", [0, 0]),
  mapZoom: getLocalStorage("mapZoom", 13),
  travelMode: getLocalStorage("travelMode", "Casual Walking"),
  focusedWaypointIndex: null,
  isProgrammaticMove: false,
  startTime: getLocalStorage("startTime", "08:00:00"),

  totalDistance: 0,
  totalTravelTime: 0,
  totalJourneyTime: "0:00",
  finalArrivalTime: "0:00",
  inProgress: false,
  progressText: "",
};

if (initialState.gpxData) {
  const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
    calculateWaypointStatistics(initialState.gpxData, initialState.startTime);

  initialState.totalDistance = totalDistance;
  initialState.totalTravelTime = totalTravelTime;
  initialState.totalJourneyTime = totalJourneyTime;
  initialState.finalArrivalTime = finalArrivalTime;
}

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case "SET_IN_PROGRESS": {
      return {
        ...state,
        inProgress: action.payload.inProgress,
        progressText: action.payload.text,
      };
    }

    case "INITIALIZE_STATE": {
      const gpxData = action.payload.gpxData;
      let waypointStats = {
        totalDistance: 0,
        totalTravelTime: 0,
        totalJourneyTime: "0:00",
        finalArrivalTime: "0:00",
      };

      if (gpxData) {
        waypointStats = calculateWaypointStatistics(gpxData, action.payload.startTime);
      }

      return {
        ...state,
        ...action.payload,
        ...waypointStats,
      };
    }

    case "SET_TRAVEL_MODE": {
      if (typeof action.payload === "string" && action.payload in travelModes) {
        if (state.gpxData) {
          const updatedTrackParts = calculateTravelTimes(state.gpxData, action.payload as TravelMode);
          const updatedGPXData = { ...state.gpxData, trackParts: updatedTrackParts };

          setLocalStorage("travelMode", action.payload);
          setLocalStorage("gpxData", updatedGPXData);

          const updatedWaypointsWithTimes = calculateRelativeTimes(updatedGPXData.waypoints, updatedTrackParts);
          const finalGPXDataWithTimes = { ...updatedGPXData, waypoints: updatedWaypointsWithTimes };

          const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
            calculateWaypointStatistics(finalGPXDataWithTimes, state.startTime);

          return {
            ...state,
            travelMode: action.payload as TravelMode,
            gpxData: finalGPXDataWithTimes,
            totalDistance,
            totalTravelTime,
            totalJourneyTime,
            finalArrivalTime,
          };
        }

        setLocalStorage("travelMode", action.payload);
        return { ...state, travelMode: action.payload as TravelMode };
      }
      return state;
    }

    case "CLEAR_PREVIOUS_DATA":
      removeLocalStorage("gpxData");
      removeLocalStorage("dataVersion");
      removeLocalStorage("stopTimes");
      removeLocalStorage("waypointNames");

      return {
        ...initialState,
        mapMode: state.mapMode,
        travelMode: state.travelMode,
        gpxData: null,
      };

    case "SET_GPX_DATA": {
      const updatedTrackParts = calculateTravelTimes(action.payload, state.travelMode);
      const updatedGPXData = { ...action.payload, trackParts: updatedTrackParts };

      const averageCoord = calculateAverageCoordinate(
        updatedGPXData.waypoints.map((wp: { lat: string; lon: string }) => ({
          lat: parseFloat(wp.lat),
          lon: parseFloat(wp.lon),
        }))
      );

      const updatedWaypointsWithTimes = calculateRelativeTimes(updatedGPXData.waypoints, updatedTrackParts);
      const updatedGPXDataWithTimes = { ...updatedGPXData, waypoints: updatedWaypointsWithTimes };

      setLocalStorage("gpxData", updatedGPXDataWithTimes);
      setLocalStorage("dataVersion", 0);

      const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
        calculateWaypointStatistics(updatedGPXDataWithTimes, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXDataWithTimes,
        mapCenter: averageCoord ? [averageCoord.lat, averageCoord.lon] : state.mapCenter,
        isProgrammaticMove: true,
        dataVersion: 0,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "SET_GPX_NAME": {
      if (!state.gpxData) {
        console.error("No GPX data available to update GPX name.");
        return state;
      }

      const updatedGPXData = { ...state.gpxData, gpxName: action.payload };
      setLocalStorage("gpxData", updatedGPXData);

      return {
        ...state,
        gpxData: updatedGPXData,
      };
    }

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

      const updatedGPXData = { ...state.gpxData, waypoints: updatedWaypoints };
      setLocalStorage("gpxData", updatedGPXData);

      return {
        ...state,
        gpxData: updatedGPXData,
      };
    }

    case "UPDATE_STOP_TIME": {
      if (!state.gpxData || !state.gpxData.waypoints) return state;

      const updatedWaypointsWithStops = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, stopTime: action.payload.stopTime };
        }
        return waypoint;
      });

      const updatedGPXDataWithStops = { ...state.gpxData, waypoints: updatedWaypointsWithStops };
      setLocalStorage("gpxData", updatedGPXDataWithStops);

      const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
        calculateWaypointStatistics(updatedGPXDataWithStops, state.startTime);

      const updatedWaypointsWithTimes = calculateRelativeTimes(updatedGPXDataWithStops.waypoints, updatedGPXDataWithStops.trackParts);
      const finalGPXDataWithTimes = { ...updatedGPXDataWithStops, waypoints: updatedWaypointsWithTimes };

      setLocalStorage("gpxData", finalGPXDataWithTimes);

      return {
        ...state,
        gpxData: finalGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "UPDATE_DURATION_MULTIPLIER": {
      const { index, multiplier } = action.payload;

      if (!state.gpxData || !state.gpxData.trackParts) return state;

      const updatedTrackParts = state.gpxData.trackParts.map((part, idx) =>
        idx === index ? { ...part, durationMultiplier: multiplier } : part
      );

      const updatedTravelTimes = calculateTravelTimes({ ...state.gpxData, trackParts: updatedTrackParts }, state.travelMode);
      const updatedWaypointsWithTimes = calculateRelativeTimes(state.gpxData.waypoints, updatedTravelTimes);
      const updatedGPXDataWithTimes = { ...state.gpxData, trackParts: updatedTravelTimes, waypoints: updatedWaypointsWithTimes };

      const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
        calculateWaypointStatistics(updatedGPXDataWithTimes, state.startTime);

      setLocalStorage("gpxData", updatedGPXDataWithTimes);

      return {
        ...state,
        gpxData: updatedGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "UPDATE_RELATIVE_TIMES": {
      if (!state.gpxData || !state.gpxData.waypoints) return state;

      const updatedWaypointsWithTimes = state.gpxData.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, relativeTimes: action.payload.relativeTimes };
        }
        return waypoint;
      });

      const updatedGPXDataWithTimes = { ...state.gpxData, waypoints: updatedWaypointsWithTimes };
      setLocalStorage("gpxData", updatedGPXDataWithTimes);

      const { totalDistance, totalTravelTime, totalJourneyTime, finalArrivalTime } =
        calculateWaypointStatistics(updatedGPXDataWithTimes, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "INCREMENT_DATA_VERSION":
      const updatedDataVersion = state.dataVersion + 1;
      setLocalStorage("dataVersion", updatedDataVersion);
      return { ...state, dataVersion: updatedDataVersion };

    case "SET_START_TIME":
      setLocalStorage("startTime", action.payload);
      return { ...state, startTime: action.payload };

    case "SET_MAP_MODE":
      setLocalStorage("mapMode", action.payload);
      return { ...state, mapMode: action.payload };

    case "SET_MAP_CENTER":
      setLocalStorage("mapCenter", action.payload);
      return { ...state, mapCenter: action.payload };

    case "SET_IS_PROGRAMMATIC_MOVE":
      return { ...state, isProgrammaticMove: action.payload };

    case "SET_MAP_ZOOM":
      setLocalStorage("mapZoom", action.payload);
      return { ...state, mapZoom: action.payload };

    case "SET_FOCUSED_WAYPOINT":
      return { ...state, focusedWaypointIndex: action.payload };

    default:
      return state;
  }
};