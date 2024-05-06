interface StateConfig {
  [key: string]: {
    key: string;
    defaultValue: any;
  };
}

const stateConfig: StateConfig = {
  mapMode: { key: "mapMode", defaultValue: "ele" },
  mapCenter: { key: "mapCenter", defaultValue: [0, 0] },
  travelMode: { key: "travelMode", defaultValue: "Casual Walking" },
  mapZoom: { key: "mapZoom", defaultValue: 13 },
  gpxData: { key: "gpxData", defaultValue: null },
  dataVersion: { key: "dataVersion", defaultValue: 0 },
  stopTimes: { key: "stopTimes", defaultValue: undefined },
};

export default stateConfig;
