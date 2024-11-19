import { Action } from "./actions";
import L, { LatLngTuple } from "leaflet";
import travelModes, { TravelMode } from "../constants/travelModes";
import calculateWaypointStatistics from "../utils/calculateWaypointStatistics";
import calculateRelativeTimes from "../utils/calculateRelativeTimes";
import { GPXData } from "../utils/types";
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from "../utils/localStorageUtils";
import calculateTravelTimes from "../utils/calculateTravelTimes";
import { calculateValueRange } from "../utils/calculateValueRange";
import { SET_PROGRAMMATIC_ACTION } from "./actions";
import calculateCenterFromBounds from "../utils/calculateCenterFromBonds";
import { imageService } from "../utils/globalImageService";

export interface GlobalState {
  gpxData: GPXData | null;
  mapBounds?: [LatLngTuple, LatLngTuple];
  mapMode: "ele" | "curve" | "slope" | "speedLimit";
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
  programmaticAction: "fitBounds" | "focusWaypoint" | null;
  inProgress: boolean;
  progressText: string;
  highlightRange: [number, number];
  highlightMode: boolean;
  currentTrackIndex: number | null;
  valueRanges: {
    ele: { minValue: number; maxValue: number };
    curve: { minValue: number; maxValue: number };
    slope: { minValue: number; maxValue: number };
    speedLimit: { minValue: number; maxValue: number };
  };
}

export const initialState: GlobalState = {
  dataVersion: getLocalStorage("dataVersion", 0),
  gpxData: getLocalStorage("gpxData", null),
  currentTrackIndex: getLocalStorage("currentTrackIndex", 0),
  mapMode: getLocalStorage("mapMode", "ele"),
  mapCenter: getLocalStorage("mapCenter", [0, 0]),
  mapZoom: getLocalStorage("mapZoom", 13),
  travelMode: getLocalStorage("travelMode", "Casual Walking"),
  focusedWaypointIndex: null,
  isProgrammaticMove: true,
  programmaticAction: null,
  startTime: getLocalStorage("startTime", "08:00:00"),
  totalDistance: 0,
  totalTravelTime: 0,
  totalJourneyTime: "0:00",
  finalArrivalTime: "0:00",
  inProgress: false,
  progressText: "",
  highlightRange: [0, 100],
  highlightMode: false,
  valueRanges: {
    ele: { minValue: 0, maxValue: 100 },
    curve: { minValue: 0, maxValue: 100 },
    slope: { minValue: 0, maxValue: 100 },
    speedLimit: { minValue: 0, maxValue: 200 },
  },
};

if (initialState.gpxData && initialState.currentTrackIndex !== null) {
  const currentTrack =
    initialState.gpxData.tracks[initialState.currentTrackIndex];

  // Check if currentTrack is valid and has waypoints and parts
  if (currentTrack && currentTrack.waypoints && currentTrack.parts) {
    const {
      totalDistance,
      totalTravelTime,
      totalJourneyTime,
      finalArrivalTime,
    } = calculateWaypointStatistics(currentTrack, initialState.startTime);

    initialState.totalDistance = totalDistance;
    initialState.totalTravelTime = totalTravelTime;
    initialState.totalJourneyTime = totalJourneyTime;
    initialState.finalArrivalTime = finalArrivalTime;
  } else {
    console.warn(
      "Skipping waypoint statistics calculation due to missing track data."
    );
  }
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

      removeLocalStorage("currentTrackIndex");

      if (!gpxData || !gpxData.tracks || gpxData.tracks.length === 0) {
        console.error("No valid GPX data or tracks available");
        return state;
      }

      const validTrackIndex = state.currentTrackIndex ?? 0;
      const currentTrack = gpxData.tracks[validTrackIndex];

      if (!currentTrack || !currentTrack.waypoints || !currentTrack.parts) {
        console.error("Current track, waypoints, or parts are undefined");
        return state;
      }

      const { waypoints = [], parts = [] } = currentTrack;
      if (waypoints.length === 0 || parts.length === 0) {
        console.warn("No waypoints or track parts found for the current track");
        return {
          ...state,
          gpxData,
          currentTrackIndex: validTrackIndex,
        };
      }

      const updatedWaypointsWithTimes = calculateRelativeTimes(
        waypoints,
        parts
      );

      const updatedTrackWithTimes = {
        ...currentTrack,
        waypoints: updatedWaypointsWithTimes,
      };

      const updatedGPXData = {
        ...gpxData,
        tracks: gpxData.tracks.map((track, index) =>
          index === validTrackIndex ? updatedTrackWithTimes : track
        ),
      };

      const waypointStats = calculateWaypointStatistics(
        updatedTrackWithTimes,
        action.payload.startTime
      );

      setLocalStorage("gpxData", updatedGPXData);

      return {
        ...state,
        ...action.payload,
        gpxData: updatedGPXData,
        ...waypointStats,
        currentTrackIndex: validTrackIndex,
      };
    }

    case "SET_TRAVEL_MODE": {
      if (typeof action.payload === "string" && action.payload in travelModes) {
        if (state.gpxData && state.currentTrackIndex !== null) {
          // Update travel times for the current track.
          const updatedTracks = state.gpxData.tracks.map((track, index) =>
            index === state.currentTrackIndex
              ? {
                  ...track,
                  parts: calculateTravelTimes(
                    [track],
                    action.payload as keyof typeof travelModes
                  ),
                }
              : track
          );

          // Recalculate waypoints with updated travel mode
          const updatedWaypointsWithTimes = calculateRelativeTimes(
            updatedTracks[state.currentTrackIndex].waypoints,
            updatedTracks[state.currentTrackIndex].parts
          );

          const updatedTrackWithTimes = {
            ...updatedTracks[state.currentTrackIndex],
            waypoints: updatedWaypointsWithTimes,
          };

          const updatedGPXData = {
            ...state.gpxData,
            tracks: updatedTracks.map((track, index) =>
              index === state.currentTrackIndex ? updatedTrackWithTimes : track
            ),
          };

          // Persist the updated state
          setLocalStorage("travelMode", action.payload);
          setLocalStorage("gpxData", updatedGPXData);

          // Recalculate statistics for updated current track
          const {
            totalDistance,
            totalTravelTime,
            totalJourneyTime,
            finalArrivalTime,
          } = calculateWaypointStatistics(
            updatedTrackWithTimes,
            state.startTime
          );

          return {
            ...state,
            travelMode: action.payload as TravelMode,
            gpxData: updatedGPXData,
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

    case "CLEAR_PREVIOUS_DATA": {
      // Remove GPX-related data
      removeLocalStorage("gpxData");
      removeLocalStorage("dataVersion");
      removeLocalStorage("stopTimes");
      removeLocalStorage("currentTrackIndex");
    
      // Clear all locally stored image URLs
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("imageUrl-")) {
          localStorage.removeItem(key);
        }
      });
    
      imageService.clearCache();
    
      return {
        ...initialState,
        mapMode: state.mapMode,
        travelMode: state.travelMode,
        gpxData: null,
        currentTrackIndex: 0,
      };
    }

    case "SET_GPX_DATA": {
      const updatedTracks = action.payload.tracks.map((track) => ({
        ...track,
        parts: calculateTravelTimes([track], state.travelMode),
      }));

      const updatedGPXData = { ...action.payload, tracks: updatedTracks };
      const currentTrack = updatedTracks[0]; // Always start with track index 0

      // Calculate new value ranges for the current track
      const newValueRanges = {
        ele: calculateValueRange([currentTrack], "ele", 0),
        curve: calculateValueRange([currentTrack], "curve", 1000),
        slope: calculateValueRange([currentTrack], "slope", 0),
        speedLimit: calculateValueRange([currentTrack], "speedLimit", 90),
      };

      setLocalStorage("gpxData", updatedGPXData);
      setLocalStorage("dataVersion", 0);
      setLocalStorage("currentTrackIndex", 0); // Reset track index in local storage

      const updatedWaypointsWithTimes = calculateRelativeTimes(
        currentTrack.waypoints,
        currentTrack.parts
      );

      const finalTrackWithTimes = {
        ...currentTrack,
        waypoints: updatedWaypointsWithTimes,
      };

      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(finalTrackWithTimes, state.startTime);

      return {
        ...state,
        gpxData: updatedGPXData,
        valueRanges: newValueRanges,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
        currentTrackIndex: 0,
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

      const updatedWaypoints = state.gpxData.referenceWaypoints.map(
        (waypoint, idx) => {
          if (idx === action.payload.index) {
            return { ...waypoint, name: action.payload.name };
          }
          return waypoint;
        }
      );

      const updatedGPXData = {
        ...state.gpxData,
        referenceWaypoints: updatedWaypoints,
      };
      setLocalStorage("gpxData", updatedGPXData);

      return {
        ...state,
        gpxData: updatedGPXData,
      };
    }

    case "SET_WAYPOINT_IMAGE": {
      const { index, imageUrl } = action.payload;
      if (!state.gpxData) return state;

      const updatedReferenceWaypoints = state.gpxData.referenceWaypoints.map(
        (waypoint, i) => {
          if (i === index) {
            console.log(`Updating image for waypoint ${index}: ${imageUrl}`);
            return { ...waypoint, imageUrl };
          }
          return waypoint;
        }
      );

      const updatedGPXData = {
        ...state.gpxData,
        referenceWaypoints: updatedReferenceWaypoints,
      };

      return {
        ...state,
        gpxData: updatedGPXData,
      };
    }

    case "UPDATE_STOP_TIME": {
      console.log(
        "New Stoptime is sent to globalstate reducer",
        action.payload.stopTime,
        "_",
        action.payload.index
      );
      if (!state.gpxData || state.currentTrackIndex === null) return state;

      const currentTrack = state.gpxData.tracks[state.currentTrackIndex];

      // Update the stop time for the specific waypoint
      const updatedWaypoints = currentTrack.waypoints.map((waypoint, idx) => {
        if (idx === action.payload.index) {
          return { ...waypoint, stopTime: action.payload.stopTime };
        }
        return waypoint;
      });

      // Recalculate the relative times for all waypoints in the updated track
      const updatedWaypointsWithTimes = calculateRelativeTimes(
        updatedWaypoints,
        currentTrack.parts
      );

      // Update the track with recalculated relative times
      const finalTrackWithTimes = {
        ...currentTrack,
        waypoints: updatedWaypointsWithTimes,
      };

      // Replace the updated track in the array of tracks
      const updatedTracks = state.gpxData.tracks.map((track, idx) =>
        idx === state.currentTrackIndex ? finalTrackWithTimes : track
      );

      // Recalculate statistics for the updated current track
      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(finalTrackWithTimes, state.startTime);

      // Create the final GPX data object
      const finalGPXDataWithTimes = {
        ...state.gpxData,
        tracks: updatedTracks,
      };

      // Persist the updated GPX data to local storage
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
      const { trackIndex, partIndex, multiplier } = action.payload;

      if (!state.gpxData || state.currentTrackIndex === null) return state;

      const updatedTracks = state.gpxData.tracks.map((track, idx) => {
        if (idx === trackIndex) {
          const updatedParts = track.parts.map((part, partIdx) =>
            partIdx === partIndex
              ? { ...part, durationMultiplier: multiplier }
              : part
          );
          return { ...track, parts: updatedParts };
        }
        return track;
      });

      // Recalculate waypoints' relative times for the updated track
      const updatedWaypointsWithTimes = calculateRelativeTimes(
        updatedTracks[trackIndex].waypoints,
        updatedTracks[trackIndex].parts
      );

      // Update the track with the recalculated waypoint times
      const finalTrackWithTimes = {
        ...updatedTracks[trackIndex],
        waypoints: updatedWaypointsWithTimes,
      };

      // Replace the updated track in the array of tracks
      const finalTracksWithTimes = updatedTracks.map((track, idx) =>
        idx === trackIndex ? finalTrackWithTimes : track
      );

      // Recalculate statistics for the current track (if it was updated)
      const currentTrack = finalTracksWithTimes[state.currentTrackIndex];
      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(currentTrack, state.startTime);

      // Update the GPX data and persist it to local storage
      const finalGPXDataWithTimes = {
        ...state.gpxData,
        tracks: finalTracksWithTimes,
      };

      setLocalStorage("gpxData", finalGPXDataWithTimes);

      // Return the updated state with recalculated statistics
      return {
        ...state,
        gpxData: finalGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "UPDATE_RELATIVE_TIMES": {
      if (!state.gpxData || state.currentTrackIndex === null) return state;

      // Get the current track based on the currentTrackIndex
      const currentTrack = state.gpxData.tracks[state.currentTrackIndex];

      // Update the relative times only for waypoints in the current track
      const updatedWaypointsWithTimes = currentTrack.waypoints.map(
        (waypoint, idx) => {
          if (idx === action.payload.index) {
            return { ...waypoint, relativeTimes: action.payload.relativeTimes };
          }
          return waypoint;
        }
      );

      // Assign the updated waypoints back to the track
      const finalTrackWithTimes = {
        ...currentTrack,
        waypoints: updatedWaypointsWithTimes,
      };

      // Update the tracks in gpxData with the updated current track
      const updatedTracks = state.gpxData.tracks.map((track, idx) =>
        idx === state.currentTrackIndex ? finalTrackWithTimes : track
      );

      // Recalculate statistics for the updated current track
      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(finalTrackWithTimes, state.startTime);

      // Create the final GPX data object
      const finalGPXDataWithTimes = {
        ...state.gpxData,
        tracks: updatedTracks,
      };

      // Persist the updated GPX data to local storage
      setLocalStorage("gpxData", finalGPXDataWithTimes);

      // Return the updated state with recalculated statistics
      return {
        ...state,
        gpxData: finalGPXDataWithTimes,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      };
    }

    case "SET_CURRENT_TRACK_INDEX": {
      const newCurrentTrackIndex = action.payload;
      setLocalStorage("currentTrackIndex", newCurrentTrackIndex);

      if (!state.gpxData || !state.gpxData.tracks[newCurrentTrackIndex]) {
        console.error("Invalid track index or missing GPX data");
        return state;
      }

      const currentTrack = state.gpxData.tracks[newCurrentTrackIndex];
      if (!currentTrack) {
        console.error("Current track is undefined");
        return state;
      }

      // Safeguard for undefined waypoints or parts
      const { waypoints = [], parts = [] } = currentTrack;

      // Calculate relative times for the new current track
      const updatedWaypointsWithTimes = calculateRelativeTimes(
        waypoints,
        parts
      );

      const updatedTrackWithTimes = {
        ...currentTrack,
        waypoints: updatedWaypointsWithTimes,
      };

      // Calculate value ranges for the new track based on mapMode
      const newValueRanges = {
        ele: calculateValueRange([currentTrack], "ele", 0),
        curve: calculateValueRange([currentTrack], "curve", 1000),
        slope: calculateValueRange([currentTrack], "slope", 0),
        speedLimit: calculateValueRange([currentTrack], "speedLimit", 0),
      };

      const {
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
      } = calculateWaypointStatistics(updatedTrackWithTimes, state.startTime);

      return {
        ...state,
        currentTrackIndex: newCurrentTrackIndex,
        totalDistance,
        totalTravelTime,
        totalJourneyTime,
        finalArrivalTime,
        valueRanges: newValueRanges, // Update valueRanges for the active track
        isProgrammaticMove: true,
      };
    }

    case "INCREMENT_DATA_VERSION": {
      const updatedDataVersion = state.dataVersion + 1;
      setLocalStorage("dataVersion", updatedDataVersion);
      return { ...state, dataVersion: updatedDataVersion };
    }

    case "SET_START_TIME":
      setLocalStorage("startTime", action.payload);
      return { ...state, startTime: action.payload };

    case "SET_MAP_MODE": {
      setLocalStorage("mapMode", action.payload);

      if (state.gpxData && state.currentTrackIndex !== null) {
        const currentTrack = state.gpxData.tracks[state.currentTrackIndex];
        const newValueRanges = {
          ele: calculateValueRange([currentTrack], "ele", 0),
          curve: calculateValueRange([currentTrack], "curve", 1000),
          slope: calculateValueRange([currentTrack], "slope", 0),
          speedLimit: calculateValueRange([currentTrack], "speedLimit", 0),
        };

        return {
          ...state,
          mapMode: action.payload,
          valueRanges: newValueRanges,
        };
      }

      return { ...state, mapMode: action.payload };
    }

    case "SET_MAP_CENTER": {
      if (state.isProgrammaticMove) {
        return state;
      }
      setLocalStorage("mapCenter", action.payload);
      return {
        ...state,
        mapCenter: action.payload,
      };
    }

    case "SET_MAP_ZOOM": {
      if (state.isProgrammaticMove) {
        return state;
      }
      setLocalStorage("mapZoom", action.payload);
      return {
        ...state,
        mapZoom: action.payload,
      };
    }

    case "SET_IS_PROGRAMMATIC_MOVE": {
      return { ...state, isProgrammaticMove: action.payload };
    }

    case "SET_MAP_ZOOM": {
      if (state.isProgrammaticMove) {
        return state;
      }

      setLocalStorage("mapZoom", action.payload);
      return {
        ...state,
        mapZoom: action.payload,
      };
    }

    case "SET_FOCUSED_WAYPOINT":
      return { ...state, focusedWaypointIndex: action.payload };

    case "SET_HIGHLIGHT":
      return {
        ...state,
        highlightRange: action.payload.range,
        highlightMode: action.payload.isActive,
      };

    case "SET_VALUE_RANGES": {
      const { modeKey, minValue, maxValue } = action.payload;
      return {
        ...state,
        valueRanges: {
          ...state.valueRanges,
          [modeKey]: { minValue, maxValue },
        },
      };
    }

    case "SET_MAP_BOUNDS": {
      console.log(
        "Reducer: Received SET_MAP_BOUNDS with payload:",
        action.payload
      );
      const bounds = L.latLngBounds(action.payload);
      if (bounds.isValid()) {
        console.log("Bounds validated:", bounds.toBBoxString());
        const updatedState = {
          ...state,
          mapBounds: action.payload,
          isProgrammaticMove: true,
        };
        console.log("Reducer state after action:", action.type, updatedState);
        return updatedState;
      }
      console.warn("SET_MAP_BOUNDS: Invalid bounds, ignoring update.");
      console.log(
        "Reducer state after action (unchanged):",
        action.type,
        state
      );
      return state;
    }

    case "SET_PROGRAMMATIC_ACTION": {
      if (action.payload === "fitBounds" && state.mapBounds) {
        const center = calculateCenterFromBounds(state.mapBounds); // Utility to calculate center
        setLocalStorage("mapCenter", center);
        setLocalStorage("mapZoom", state.mapZoom); // Assuming zoom is adjusted programmatically
      }
      if (
        action.payload === "focusWaypoint" &&
        state.focusedWaypointIndex !== null
      ) {
        const waypoint =
          state.gpxData?.referenceWaypoints[state.focusedWaypointIndex];
        if (waypoint) {
          const center = [parseFloat(waypoint.lat), parseFloat(waypoint.lon)];
          setLocalStorage("mapCenter", center);
          setLocalStorage("mapZoom", 15); // Assuming a specific zoom level
        }
      }
      // console.log("Handling programmatic action:", action.payload);
      return { ...state, programmaticAction: action.payload };
    }

    default:
      return state;
  }
};
