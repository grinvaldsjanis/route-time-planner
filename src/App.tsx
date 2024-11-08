import React, { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import GPXDownloadButton from "./components/GPXDownloadButton/GPXDownloadButton";
import { clearPreviousData, setInProgress } from "./context/actions";
import Modal from "./components/Modal/Modal";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import AboutContent from "./components/Modal/AboutContent";
import parseGPX from "./utils/parseGPX";
import ProgressIndicator from "./components/ProgressIndicator/ProgressIndicator";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

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
    dispatch(setInProgress(true, "Loading"));
    try {
      const response = await fetch(gpxFilePath, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "If-Modified-Since": "0",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch the GPX file");
      }
      const text = await response.text();

      if (text.startsWith("<!DOCTYPE html>")) {
        console.error("Fetched content is HTML, not a GPX file.");
        throw new Error("Fetched content is HTML, not a GPX file.");
      }

      dispatch(clearPreviousData());
      dispatch(setInProgress(true, "Processing GPX"));

      const parsedGPXData = await parseGPX(text, state.travelMode, dispatch);
      dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
    } catch (error) {
      console.error("Error loading GPX file:", error);
    } finally {
      dispatch(setInProgress(false, ""));
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
              Try Example GPX!
            </button>
          </div>
        )}
        {state.inProgress && <ProgressIndicator text={state.progressText} />}
        {state.gpxData && (
          <>
            <div className="App-sidebar">
              <TravelModeSelector />
              <WaypointList />
            </div>
            <div className="App-graph-container">
              <ErrorBoundary>
                {" "}
                {/* Wrap MapView with ErrorBoundary */}
                <MapView />
              </ErrorBoundary>
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
