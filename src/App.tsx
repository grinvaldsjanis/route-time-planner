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

function App() {
  const [gpxData, setGpxData] = useState<any>(null);
  const [gpxDataKey, setGpxDataKey] = useState<number>(0);
  const { dispatch } = useGlobalState();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUploaded = async (fileContent: string) => {
    setIsLoading(true); // Set loading to true at the start of file processing

    const parsedGPXData = parseGPX(fileContent);
    console.log("GPX Data:", parsedGPXData);
  
    localStorage.setItem("gpxData", JSON.stringify(parsedGPXData));
    dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });

    setGpxData(parsedGPXData);
    setGpxDataKey(prevKey => prevKey + 1);

    setIsLoading(false); // Set loading to false once processing is complete
  };

  useEffect(() => {
    const savedGpxData = localStorage.getItem("gpxData");
    if (savedGpxData) {
      setGpxData(JSON.parse(savedGpxData));
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Display a loading indicator or message
  }

  return (
    <div className="App">
      <FileUploader onFileUploaded={handleFileUploaded} />
      {gpxData && (
        <div className="App-main-container">
          <WaypointList waypoints={gpxData.waypoints} />
          <div className="App-graph-container">
            <MapView
              waypoints={gpxData.waypoints}
              tracks={gpxData.tracks}
              gpxDataKey={gpxDataKey}
            />
            <ScaleStrip tracks={gpxData.tracks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
