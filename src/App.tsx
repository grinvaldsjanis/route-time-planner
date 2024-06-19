// src/App.tsx
import React, { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import GPXDownloadButton from "./components/GPXDownloadButton/GPXDownloadButton";
import { clearPreviousData } from "./context/actions";
import Modal from "./components/Modal/Modal";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import AboutContent from "./components/Modal/AboutContent";
import parseGPX from "./utils/parseGPX";
import travelModes from "./constants/travelModes";

function App() {
  const { state, dispatch } = useGlobalState();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleClearData = () => {
    dispatch(clearPreviousData());
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const gpxFilePath =
    process.env.REACT_APP_PUBLIC_FILES_URL + "/Ziemelkurzeme.gpx";

  const handleLoadStoredGPX = async () => {
    try {
      const response = await fetch(gpxFilePath);
      if (!response.ok) {
        throw new Error("Failed to fetch the GPX file");
      }
      const text = await response.text();
      console.log("Fetched GPX Data:", text); // Debugging line
      dispatch(clearPreviousData());
      const parsedGPXData = await parseGPX(
        text,
        state.travelMode as keyof typeof travelModes
      );
      console.log("Parsed GPX Data:", parsedGPXData); // Debugging line
      dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
    } catch (error) {
      console.error("Error loading GPX file:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo">
          <h4>GPX Time Planner</h4>
        </div>
        <div className="file-buttons">
          <FileUploader />
          <GPXDownloadButton />
          <button onClick={handleClearData} className="clear-button">
            Clear Data
          </button>
        </div>
      </header>
      <div className="App-main-container">
        {!state.gpxData && (
          <div className="try-stored-gpx">
            <button onClick={handleLoadStoredGPX} className="try-button">
              Try Example GPX
            </button>
          </div>
        )}
        {state.gpxData && (
          <>
            <div className="App-sidebar">
              <TravelModeSelector />
              <WaypointList />
            </div>
            <div className="App-graph-container">
              <MapView />
              <ScaleStrip />
            </div>
          </>
        )}
      </div>
      <footer className="footer">
        Under development by Janis Grinvalds.&emsp; &emsp;
        <button onClick={toggleModal} className="about-button">
          About
        </button>
      </footer>
      <Modal show={isModalOpen} onClose={toggleModal}>
        <AboutContent />
      </Modal>
    </div>
  );
}

export default App;
