// App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import parseGPX from "./utils/parseGPX";
import React from "react";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import travelModes from "./constants/travelModes";
import calculateAverageCoordinate from "./utils/calculateAverageCoordinate";

function App() {
  const { state, dispatch } = useGlobalState();
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const handleFileUploaded = async (fileContent: string) => {
    setIsParsing(true);
    const parsedGPXData = parseGPX(
      fileContent,
      state.travelMode as keyof typeof travelModes
    );
  
    // Convert waypoints to Coordinate array
    const coordinates = parsedGPXData.waypoints.map(wp => ({
      lat: parseFloat(wp.lat),
      lon: parseFloat(wp.lon)
    }));
  
    const averageCoord = calculateAverageCoordinate(coordinates);
    if (averageCoord) {
      // Dispatch the new center to global state
      dispatch({ type: "SET_MAP_CENTER", payload: [averageCoord.lat, averageCoord.lon] });
    }
  
    dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
    setIsParsing(false);
  };

  useEffect(() => {
    const savedGpxData = localStorage.getItem("gpxData");
    if (savedGpxData) {
      dispatch({ type: "SET_GPX_DATA", payload: JSON.parse(savedGpxData) });
    }
  }, [dispatch]);

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

      {state.gpxData && !isParsing && (
        <div className="App-main-container">
          <div className="App-sidebar">
            <TravelModeSelector />
            {state.gpxData.waypoints && state.gpxData.trackParts && (
              <WaypointList
                trackParts={state.gpxData.trackParts}
                waypoints={state.gpxData.waypoints}
              />
            )}
          </div>

          <div className="App-graph-container">
            <MapView />
            <ScaleStrip tracks={state.gpxData.tracks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
