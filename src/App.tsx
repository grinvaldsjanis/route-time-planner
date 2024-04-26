// App.tsx
import { useEffect, useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import parseGPX from "./utils/parseGPX";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import travelModes from "./constants/travelModes";
import { initializeState } from "./utils/initializeState"; // Ensure this is correctly imported

function App() {
  const { state, dispatch } = useGlobalState();
  const [isParsing, setIsParsing] = useState<boolean>(false);

  useEffect(() => {
    // Initialize app state from stored values or defaults
    const initialState = initializeState(); // Assuming initializeState returns the correct structure
    dispatch({ type: "INITIALIZE_STATE", payload: initialState });
  }, [dispatch]);

  const handleFileUploaded = async (fileContent: string) => {
    setIsParsing(true);
    const parsedGPXData = parseGPX(
      fileContent,
      state.travelMode as keyof typeof travelModes
    );
    dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
    setIsParsing(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo">
          <h4>GPX Time Planner</h4>
        </div>
        <FileUploader onFileUploaded={handleFileUploaded} />
      </header>
      {state.gpxData && !isParsing && (
        <div className="App-main-container">
          <div className="App-sidebar">
            <TravelModeSelector />
            <WaypointList />
          </div>
          <div className="App-graph-container">
            <MapView />
            <ScaleStrip tracks={state.gpxData.tracks} />
          </div>
        </div>
      )}
      <footer className="footer">
        Gamma version. 2024. By Janis Grinvalds
      </footer>
    </div>
  );
}

export default App;
