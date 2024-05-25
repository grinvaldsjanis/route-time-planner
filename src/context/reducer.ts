import { Action, UPDATE_DURATION_MULTIPLIER } from "./actions";
import { GPXData } from "../utils/parseGPX";
import { LatLngTuple } from "leaflet";
import travelModes, { TravelMode } from "../constants/travelModes";
import calculateTravelTimes from "../utils/calculateTravelTimes";
import calculateAverageCoordinate from "../utils/calculateAverageCoordinate";
import calculateWaypointStatistics from "../utils/calculateWaypointStatistics";
import calculateRelativeTimes from "../utils/calculateRelativeTimes";

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
    case "INITIALIZE_STATE": {
      const gpxData = action.payload.gpxData;
      let waypointStats = {
        totalDistance: 0,
        totalTravelTime: 0,
        totalJourneyTime: "0:00",
        finalArrivalTime: "0:00",
      };

      if (gpxData) {
        waypointStats = calculateWaypointStatistics(
          gpxData,
          action.payload.startTime
        );
      }

      return {
        ...state,
        ...action.payload,
        ...waypointStats,
      };
    }

    case "CLEAR_PREVIOUS_DATA":
      localStorage.removeItem("gpxData");
      localStorage.removeItem("dataVersion");
      localStorage.removeItem("stopTimes");
      localStorage.removeItem("waypointNames"); // Clear waypoint names

      return {
        ...initialState,
        mapMode: state.mapMode,
        travelMode: state.travelMode,
      };

    case "SET_GPX_DATA": {
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

      const updatedWaypointsWithTimes = calculateRelativeTimes(
        updatedGPXData.waypoints,
        updatedTrackParts
      );

      const updatedGPXDataWithTimes = {
        ...updatedGPXData,
        waypoints: updatedWaypointsWithTimes,
      };

      setLocalStorage("gpxData", updatedGPXDataWithTimes);
      setLocalStorage("dataVersion", 0);
      if (averageCoord) {
        setLocalStorage("mapCenter", [averageCoord.lat, averageCoord.lon]);
      }

      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(updatedGPXDataWithTimes, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXDataWithTimes,
        mapCenter: averageCoord
          ? [averageCoord.lat, averageCoord.lon]
          : state.mapCenter,
        dataVersion: 0,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "UPDATE_RELATIVE_TIMES":
      if (!state.gpxData || !state.gpxData.waypoints) return state;

      const updatedWaypointsWithTimes = state.gpxData.waypoints.map(
        (waypoint, idx) => {
          if (idx === action.payload.index) {
            return { ...waypoint, relativeTimes: action.payload.relativeTimes };
          }
          return waypoint;
        }
      );

      const updatedGPXDataWithTimes = {
        ...state.gpxData,
        waypoints: updatedWaypointsWithTimes,
      };

      setLocalStorage("gpxData", updatedGPXDataWithTimes);

      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(updatedGPXDataWithTimes, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };

    case "SET_MAP_MODE":
      localStorage.setItem("mapMode", action.payload);
      return { ...state, mapMode: action.payload };

    case "SET_MAP_CENTER":
      localStorage.setItem("mapCenter", JSON.stringify(action.payload));
      return { ...state, mapCenter: action.payload };
    case "SET_IS_PROGRAMMATIC_MOVE":
      return {
        ...state,
        isProgrammaticMove: action.payload,
      };
    case "SET_MAP_ZOOM":
      localStorage.setItem("mapZoom", JSON.stringify(action.payload));
      return { ...state, mapZoom: action.payload };

    case UPDATE_DURATION_MULTIPLIER: {
      if (!state.gpxData) return state;

      const updatedTrackParts = state.gpxData.trackParts.map(
        (trackPart, idx) => {
          if (idx === action.payload.index) {
            return {
              ...trackPart,
              durationMultiplier: action.payload.multiplier,
            };
          }
          return trackPart;
        }
      );

      const updatedWaypointsWithTimes = calculateRelativeTimes(
        state.gpxData.waypoints,
        updatedTrackParts
      );

      const updatedGPXData = {
        ...state.gpxData,
        trackParts: updatedTrackParts,
        waypoints: updatedWaypointsWithTimes,
      };

      setLocalStorage("gpxData", updatedGPXData);

      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(updatedGPXData, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXData,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "SET_TRAVEL_MODE": {
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

          const updatedWaypointsWithTimes = calculateRelativeTimes(
            updatedGPXData.waypoints,
            updatedTrackParts
          );

          const finalGPXDataWithTimes = {
            ...updatedGPXData,
            waypoints: updatedWaypointsWithTimes,
          };

          const {
            totalDistance,
            totalTravelTime,
            totalJourneyTime,
            finalArrivalTime,
          } = calculateWaypointStatistics(
            finalGPXDataWithTimes,
            state.startTime
          );

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

        localStorage.setItem("travelMode", JSON.stringify(action.payload));
        return { ...state, travelMode: action.payload as TravelMode };
      }
      return state;
    }

    case "INCREMENT_DATA_VERSION":
      const updatedDataVersion = state.dataVersion + 1;
      setLocalStorage("dataVersion", updatedDataVersion);
      return { ...state, dataVersion: updatedDataVersion };
    case "SET_START_TIME":
      localStorage.setItem("startTime", action.payload);
      return { ...state, startTime: action.payload };

    case "UPDATE_STOP_TIME": {
      if (!state.gpxData || !state.gpxData.waypoints) return state;

      const updatedWaypointsWithStops = state.gpxData.waypoints.map(
        (waypoint, idx) => {
          if (idx === action.payload.index) {
            return { ...waypoint, stopTime: action.payload.stopTime };
          }
          return waypoint;
        }
      );

      const updatedGPXDataWithStops = {
        ...state.gpxData,
        waypoints: updatedWaypointsWithStops,
      };

      // Save the updated GPX data in local storage
      setLocalStorage("gpxData", updatedGPXDataWithStops);

      // Recalculate journey statistics based on updated stop times
      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(updatedGPXDataWithStops, state.startTime);

      // Recalculate relative times
      const updatedWaypointsWithTimes = calculateRelativeTimes(
        updatedGPXDataWithStops.waypoints,
        updatedGPXDataWithStops.trackParts
      );

      const finalGPXDataWithTimes = {
        ...updatedGPXDataWithStops,
        waypoints: updatedWaypointsWithTimes,
      };

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
    }
    case "SET_GPX_NAME":
      if (state.gpxData) {
        const updatedGPXData = { ...state.gpxData, gpxName: action.payload };
        setLocalStorage("gpxData", updatedGPXData);
        return {
          ...state,
          gpxData: updatedGPXData,
        };
      }
      return state;
    case "SET_FOCUSED_WAYPOINT":
      return {
        ...state,
        focusedWaypointIndex: action.payload,
      };
    default:
      return state;
  }
};
