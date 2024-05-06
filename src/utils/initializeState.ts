import stateConfig from "../constants/stateConfig";
import { GlobalState } from "../context/reducer";

export const initializeState = (): GlobalState => {
  const initialState: Partial<GlobalState> = {};

  Object.keys(stateConfig).forEach((key) => {
    const item = stateConfig[key];
    const savedValue = localStorage.getItem(item.key);

    if (savedValue) {
      try {
        initialState[key as keyof GlobalState] = JSON.parse(savedValue);
      } catch (error) {
        console.error(`Error parsing localStorage item '${item.key}':`, error);
        initialState[key as keyof GlobalState] = item.defaultValue;
      }
    } else {
      initialState[key as keyof GlobalState] = item.defaultValue;
    }
  });

  return {
    gpxData: initialState.gpxData ?? null,
    mapMode: initialState.mapMode ?? 'elevation',
    mapCenter: initialState.mapCenter ?? [0, 0],
    mapZoom: initialState.mapZoom ?? 13,
    travelMode: initialState.travelMode ?? 'Casual Walking',
    dataVersion: initialState.dataVersion ?? 0,
  } as GlobalState;
};
