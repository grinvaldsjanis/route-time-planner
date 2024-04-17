// App.tsx
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import parseGPX from "./utils/parseGPX";
import React from "react";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import calculateTravelTimes from "./utils/calculateTravelTimes";
import travelModes from "./constants/travelModes";
import logo from "./logo.png";

function App() {
  const [gpxData, setGpxData] = useState<any>(null);
  const [gpxDataKey, setGpxDataKey] = useState<number>(0);
  const { state, dispatch } = useGlobalState();
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const handleFileUploaded = async (fileContent: string) => {
    setIsParsing(true);
    const parsedGPXData = parseGPX(
      fileContent,
      state.travelMode as keyof typeof travelModes
    );
    dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
    setGpxData(parsedGPXData);
    setGpxDataKey((prevKey) => prevKey + 1);
    setIsParsing(false);
  };

  useEffect(() => {
    const savedGpxData = localStorage.getItem("gpxData");
    if (savedGpxData) {
      setGpxData(JSON.parse(savedGpxData));
    }
  }, []);

  useEffect(() => {
    if (gpxData && state.travelMode) {
      const updatedTrackParts = calculateTravelTimes(
        gpxData,
        state.travelMode as keyof typeof travelModes
      );
      if (
        JSON.stringify(updatedTrackParts) !== JSON.stringify(gpxData.trackParts)
      ) {
        setGpxData({ ...gpxData, trackParts: updatedTrackParts });
      }
    }
  }, [state.travelMode, gpxData]);

  if (isParsing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <div className="App-header">
        <div className="App-logo">
          <h4>GPX Time Planner</h4>
        </div>

        <FileUploader onFileUploaded={handleFileUploaded} />
      </div>

      {gpxData && !isParsing && (
        <div className="App-main-container">
          <div className="App-sidebar">
            <TravelModeSelector />
            <WaypointList
              trackParts={gpxData.trackParts}
              waypoints={gpxData.waypoints}
            />
          </div>

          <div className="App-graph-container">
            <MapView />
            <ScaleStrip tracks={gpxData.tracks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
