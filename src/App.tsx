// App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import parseGPX from "./utils/parseGPX";
import React from "react";
import ElevationScale from "./components/ElevationScale/ElevationScale";

function App() {
  const [gpxData, setGpxData] = useState<any>(null);

  const handleFileUploaded = (fileContent: string) => {
    const parsedData = parseGPX(fileContent);
    console.log("GPX Data:", parsedData);
    setGpxData(parsedData);

    // Store the parsed data in localStorage
    localStorage.setItem("gpxData", JSON.stringify(parsedData));
  };

  useEffect(() => {
    const savedGpxData = localStorage.getItem("gpxData");
    if (savedGpxData) {
      setGpxData(JSON.parse(savedGpxData));
    }
  }, []);

  return (
    <div className="App">
      <FileUploader onFileUploaded={handleFileUploaded} />
      {gpxData && (
        <div className="App-main-container">
          <WaypointList waypoints={gpxData.waypoints} />
          <div className="App-graph-container">
            <MapView
              waypoints={gpxData.waypoints}
              routes={gpxData.routes}
              tracks={gpxData.tracks}
            />
             <ElevationScale tracks={gpxData.tracks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
