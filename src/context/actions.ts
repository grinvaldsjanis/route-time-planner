import { LatLngTuple } from "leaflet";
import { GPXData } from "../utils/types";
import { TravelMode } from "../constants/travelModes";
import { GlobalState } from "./reducer";

export const SET_GPX_DATA = "SET_GPX_DATA";
export const SET_MAP_MODE = "SET_MAP_MODE";
export const INCREMENT_DATA_VERSION = "INCREMENT_DATA_VERSION";
export const SET_TRAVEL_MODE = "SET_TRAVEL_MODE";
export const SET_START_TIME = "SET_START_TIME";
export const UPDATE_STOP_TIME = "UPDATE_STOP_TIME";
export const SET_WAYPOINT_NAME = "SET_WAYPOINT_NAME";
export const INITIALIZE_STATE = "INITIALIZE_STATE";
export const CLEAR_PREVIOUS_DATA = "CLEAR_PREVIOUS_DATA";
export const SET_FOCUSED_WAYPOINT = "SET_FOCUSED_WAYPOINT";
export const SET_GPX_NAME = "SET_GPX_NAME";
export const UPDATE_RELATIVE_TIMES = "UPDATE_RELATIVE_TIMES";
export const SET_IS_PROGRAMMATIC_MOVE = "SET_IS_PROGRAMMATIC_MOVE";
export const SET_MAP_CENTER = "SET_MAP_CENTER";
export const SET_MAP_ZOOM = "SET_MAP_ZOOM";
export const UPDATE_DURATION_MULTIPLIER = "UPDATE_DURATION_MULTIPLIER"; 
export const SET_IN_PROGRESS = "SET_IN_PROGRESS";
export const SET_HIGHLIGHT = "SET_HIGHLIGHT";
export const SET_CURRENT_TRACK_INDEX = "SET_CURRENT_TRACK_INDEX";
export const SET_VALUE_RANGES = "SET_VALUE_RANGES"; // Added new action type

export interface SetHighlightAction {
  type: typeof SET_HIGHLIGHT;
  payload: {
    range: [number, number];
    isActive: boolean;
  };
}

export interface SetGPXNameAction {
  type: typeof SET_GPX_NAME;
  payload: string;
}

export interface SetInProgressAction {
  type: typeof SET_IN_PROGRESS;
  payload: {
    inProgress: boolean;
    text: string;
  };
}

export interface UpdateDurationMultiplierAction {
  type: typeof UPDATE_DURATION_MULTIPLIER;
  payload: {
    trackIndex: number;
    partIndex: number;
    multiplier: number;
  };
}

export interface InitializeStateAction {
  type: typeof INITIALIZE_STATE;
  payload: GlobalState;
}

export interface SetFocusedWaypointAction {
  type: typeof SET_FOCUSED_WAYPOINT;
  payload: number | null;
}

export interface SetWaypointName {
  type: typeof SET_WAYPOINT_NAME;
  payload: {
    index: number;
    name: string;
  };
}

export interface IncrementDataVersionAction {
  type: typeof INCREMENT_DATA_VERSION;
}

export interface ClearPreviousDataAction {
  type: typeof CLEAR_PREVIOUS_DATA;
}

export interface SetGPXDataAction {
  type: typeof SET_GPX_DATA;
  payload: GPXData;
}

export interface SetMapModeAction {
  type: typeof SET_MAP_MODE;
  payload: "ele" | "curve" | "slope" | "speedLimit";
}

export interface SetTravelModeAction {
  type: typeof SET_TRAVEL_MODE;
  payload: TravelMode;
}

export interface SetStartTimeAction {
  type: typeof SET_START_TIME;
  payload: string;
}

export interface UpdateStopTimeAction {
  type: typeof UPDATE_STOP_TIME;
  payload: {
    index: number;
    stopTime: number;
  };
}

export interface UpdateRelativeTimesAction {
  type: typeof UPDATE_RELATIVE_TIMES;
  payload: {
    index: number;
    relativeTimes: {
      arrivalSeconds: number;
      departureSeconds: number;
    };
  };
}

export interface SetIsProgrammaticMoveAction {
  type: typeof SET_IS_PROGRAMMATIC_MOVE;
  payload: boolean;
}

export interface SetMapCenterAction {
  type: typeof SET_MAP_CENTER;
  payload: LatLngTuple;
}

export interface SetMapZoomAction {
  type: typeof SET_MAP_ZOOM;
  payload: number;
}

export interface SetCurrentTrackIndex {
  type: typeof SET_CURRENT_TRACK_INDEX;
  payload: number;
}

export interface SetValueRangesAction {
  type: typeof SET_VALUE_RANGES;
  payload: {
    modeKey: string;
    minValue: number;
    maxValue: number;
  };
}

export type Action =
  | SetGPXDataAction
  | UpdateRelativeTimesAction
  | SetMapModeAction
  | SetMapCenterAction
  | SetMapZoomAction
  | IncrementDataVersionAction
  | UpdateStopTimeAction
  | SetTravelModeAction
  | SetWaypointName
  | InitializeStateAction
  | SetStartTimeAction
  | ClearPreviousDataAction
  | SetFocusedWaypointAction
  | SetGPXNameAction
  | SetIsProgrammaticMoveAction
  | UpdateDurationMultiplierAction
  | SetInProgressAction
  | SetHighlightAction
  | SetCurrentTrackIndex
  | SetValueRangesAction; // Add the new action type

// Action creators

export const setHighlight = (
  range: [number, number],
  isActive: boolean
): SetHighlightAction => ({
  type: SET_HIGHLIGHT,
  payload: {
    range,
    isActive,
  },
});

export const setGPXData = (data: GPXData): SetGPXDataAction => ({
  type: SET_GPX_DATA,
  payload: data,
});

export const updateRelativeTimes = (
  index: number,
  relativeTimes: { arrivalSeconds: number; departureSeconds: number }
): UpdateRelativeTimesAction => ({
  type: UPDATE_RELATIVE_TIMES,
  payload: { index, relativeTimes },
});

export const updateDurationMultiplier = (
  trackIndex: number,
  partIndex: number,
  multiplier: number
): UpdateDurationMultiplierAction => ({
  type: UPDATE_DURATION_MULTIPLIER,
  payload: { trackIndex, partIndex, multiplier },
});

export const setMapMode = (
  mode: "ele" | "curve" | "slope" | "speedLimit"
): SetMapModeAction => ({
  type: SET_MAP_MODE,
  payload: mode,
});

export const setTravelMode = (mode: TravelMode): SetTravelModeAction => ({
  type: SET_TRAVEL_MODE,
  payload: mode,
});

export const setStartTime = (time: string): SetStartTimeAction => ({
  type: SET_START_TIME,
  payload: time,
});

export const setFocusedWaypoint = (
  index: number | null
): SetFocusedWaypointAction => ({
  type: SET_FOCUSED_WAYPOINT,
  payload: index,
});

export const setGPXName = (name: string): SetGPXNameAction => ({
  type: SET_GPX_NAME,
  payload: name,
});

export const setCurrentTrackIndex = (index: number): SetCurrentTrackIndex => ({
  type: SET_CURRENT_TRACK_INDEX,
  payload: index,
});

export const incrementDataVersion = (): IncrementDataVersionAction => ({
  type: INCREMENT_DATA_VERSION,
});

export const updateStopTime = (
  index: number,
  stopTime: number
): UpdateStopTimeAction => ({
  type: UPDATE_STOP_TIME,
  payload: { index, stopTime },
});

export const setIsProgrammaticMove = (
  isProgrammatic: boolean
): SetIsProgrammaticMoveAction => ({
  type: SET_IS_PROGRAMMATIC_MOVE,
  payload: isProgrammatic,
});

export const setMapCenter = (center: LatLngTuple): SetMapCenterAction => ({
  type: SET_MAP_CENTER,
  payload: center,
});

export const setMapZoom = (zoom: number): SetMapZoomAction => ({
  type: SET_MAP_ZOOM,
  payload: zoom,
});

export const clearPreviousData = (): ClearPreviousDataAction => ({
  type: CLEAR_PREVIOUS_DATA,
});

export const setInProgress = (
  inProgress: boolean,
  text: string
): SetInProgressAction => ({
  type: SET_IN_PROGRESS,
  payload: {
    inProgress,
    text,
  },
});

// New action creator for setting value ranges
export const setValueRanges = (
  modeKey: string,
  minValue: number,
  maxValue: number
): SetValueRangesAction => ({
  type: SET_VALUE_RANGES,
  payload: { modeKey, minValue, maxValue },
});
