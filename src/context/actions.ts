// src/context/actions.ts

import { LatLngTuple } from "leaflet";
import { GPXData } from "../utils/parseGPX";

export const SET_GPX_DATA = "SET_GPX_DATA";
export const SET_MAP_MODE = "SET_MAP_MODE";

export interface SetGPXDataAction {
  type: typeof SET_GPX_DATA;
  payload: GPXData;
}

export interface SetMapModeAction {
  type: typeof SET_MAP_MODE;
  payload: string;
}

export type Action =
  | SetGPXDataAction
  | SetMapModeAction
  | SetMapCenterAction
  | SetMapZoomAction;


export const setGPXData = (data: GPXData): SetGPXDataAction => ({
  type: SET_GPX_DATA,
  payload: data,
});

export const setMapMode = (mode: string): SetMapModeAction => ({
  type: SET_MAP_MODE,
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
