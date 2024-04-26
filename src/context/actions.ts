import { LatLngTuple } from "leaflet";
import { GPXData } from "../utils/parseGPX";
import { TravelMode } from "../constants/travelModes"; // Ensure this import is correct
import { GlobalState } from "./reducer";

export const SET_GPX_DATA = "SET_GPX_DATA";
export const SET_MAP_MODE = "SET_MAP_MODE";
export const INCREMENT_DATA_VERSION = "INCREMENT_DATA_VERSION";
export const SET_TRAVEL_MODE = "SET_TRAVEL_MODE";
export const UPDATE_STOP_TIME = "UPDATE_STOP_TIME";
export const SET_WAYPOINT_NAME = "SET_WAYPOINT_NAME"
export const INITIALIZE_STATE = "INITIALIZE_STATE"; 

export interface InitializeStateAction {
  type: typeof INITIALIZE_STATE;
  payload: GlobalState;
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

export interface SetGPXDataAction {
  type: typeof SET_GPX_DATA;
  payload: GPXData;
}

export interface SetMapModeAction {
  type: typeof SET_MAP_MODE;
  payload: string;
}

export interface SetTravelModeAction {
  type: typeof SET_TRAVEL_MODE;
  payload: TravelMode;
}

export interface UpdateStopTimeAction {
  type: typeof UPDATE_STOP_TIME;
  payload: {
    index: number;
    stopTime: number;
  };
}

export type Action =
  | SetGPXDataAction
  | SetMapModeAction
  | SetMapCenterAction
  | SetMapZoomAction
  | IncrementDataVersionAction
  | UpdateStopTimeAction
  | SetTravelModeAction
  | SetWaypointName
  | InitializeStateAction;

export const setGPXData = (data: GPXData): SetGPXDataAction => ({
  type: SET_GPX_DATA,
  payload: data,
});

export const setMapMode = (mode: string): SetMapModeAction => ({
  type: SET_MAP_MODE,
  payload: mode,
});

export const setTravelMode = (mode: TravelMode): SetTravelModeAction => ({
  type: SET_TRAVEL_MODE,
  payload: mode,
});

interface SetMapCenterAction {
  type: "SET_MAP_CENTER";
  payload: LatLngTuple;
}

interface SetMapZoomAction {
  type: "SET_MAP_ZOOM";
  payload: number;
}

export const incrementDataVersion = (): IncrementDataVersionAction => ({
  type: INCREMENT_DATA_VERSION,
});

export const updateStopTime = (index: number, stopTime: number): UpdateStopTimeAction => ({
  type: UPDATE_STOP_TIME,
  payload: { index, stopTime },
});
