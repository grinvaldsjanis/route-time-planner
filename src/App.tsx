import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import GPXDownloadButton from "./components/GPXDownloadButton/GPXDownloadButton";

function App() {
  const { state } = useGlobalState();

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo">
          <h4>GPX Time Planner</h4>
        </div>
        <div className="file-buttons">
          <FileUploader />
          <GPXDownloadButton />
        </div>
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
        Under development by Janis Grinvalds.&emsp;
        <a
          href="https://chat.whatsapp.com/F7y1m1NBcEg0YiUwzV7S9R"
          target="_blank"
          rel="noopener noreferrer"
        >
          Whatsapp group for issues/features
        </a>
      </footer>
    </div>
  );
}

export default App;
