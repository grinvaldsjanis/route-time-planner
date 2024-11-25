import React, { useState } from "react";
import "./App.css";
import FileUploader from "./components/FileUploader/FileUploader";
import MapView from "./components/MapView/MapView";
import WaypointList from "./components/WaypointList/WaypointList";
import ScaleStrip from "./components/ScaleStrip/ScaleStrip";
import { useGlobalState } from "./context/GlobalContext";
import { clearPreviousData, setInProgress } from "./context/actions";
import Modal from "./components/Modal/Modal";
import TravelModeSelector from "./components/TravelModeSelector/TravelModesSelector";
import AboutContent from "./components/Modal/AboutContent";
import ProgressIndicator from "./components/ProgressIndicator/ProgressIndicator";
import { processGPXData } from "./utils/processGPX";
import TrackGraph from "./components/TrackGraph/TrackGraph";
import { FaPlay } from "react-icons/fa";
import AnimatedBackground from "./components/AnimatedBackground/AnimatedBackground";
import Menu from "./components/Menu/Menu";
import Downloader from "./components/GPXDownloadButton/Downloader";
import PlaybackController from "./components/PlaybackController/PlaybackController";

function App() {
  const { state, dispatch } = useGlobalState();
  const [isModalOpen, setModalOpen] = useState(false);

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

      await processGPXData(text, state.travelMode, dispatch);
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
        <div>
          <Menu />
          <div>
        {/* Hidden inputs for actions */}
        <FileUploader />
        {state.gpxData && <Downloader />}
      </div>
        </div>
      </header>
      <div className="App-main-container">
        {!state.gpxData && !state.inProgress && <AnimatedBackground />}
        {!state.gpxData && (
          <div className="try-stored-gpx">
            <button onClick={handleLoadStoredGPX} className="try-button">
              <FaPlay />
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
              <div className="map-view">
                <MapView />
              </div>
              <TrackGraph />
              <PlaybackController />
              <div className="scale-strip">
                <ScaleStrip />
              </div>
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
