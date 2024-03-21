// App.tsx
import { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import parseGPX from "./utils/parseGPX";

function App() {
  // Assuming gpxData structure contains waypoints, routes, and tracks after parsing
  const [gpxData, setGpxData] = useState<any>(null);

  const handleFileUploaded = (fileContent: string) => {
    // Parse the GPX file content and set the parsed data to state
    const parsedData = parseGPX(fileContent);
    console.log("GPX Data:", parsedData);
    setGpxData(parsedData);
  };

  return (
    <div className="App">
      <h1>GPX Route Time Planner</h1>
      <FileUploader onFileUploaded={handleFileUploaded} />
      {/* Conditionally render MapView and WaypointList if gpxData is not null */}
      {gpxData && (
        <>
          <MapView waypoints={gpxData.waypoints} routes={gpxData.routes} tracks={gpxData.tracks} />
          <WaypointList waypoints={gpxData.waypoints} />
        </>
      )}
    </div>
  );
}

export default App;
