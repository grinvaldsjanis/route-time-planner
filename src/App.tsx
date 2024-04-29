// App.tsx
import { useEffect } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import { initializeState } from "./utils/initializeState"; // Ensure this is correctly imported

function App() {
  const { state, dispatch } = useGlobalState();

  useEffect(() => {
    // Initialize app state from stored values or defaults
    const initialState = initializeState(); // Assuming initializeState returns the correct structure
    dispatch({ type: "INITIALIZE_STATE", payload: initialState });
  }, [dispatch]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo">
          <h4>GPX Time Planner</h4>
        </div>
        <FileUploader />
      </header>
      {state.gpxData && (
        <div className="App-main-container">
          <div className="App-sidebar">
            <TravelModeSelector />
            <WaypointList />
          </div>
          <div className="App-graph-container">
            <MapView />
            <ScaleStrip />
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
