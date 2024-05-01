import React from "react";
import createGPX from "../../utils/createGPX";
import { useGlobalState } from "../../context/GlobalContext";
import { FaDownload } from "react-icons/fa6";
import "./GPXDownloadButton.css";

const GPXDownloadButton: React.FC = () => {
  const { state } = useGlobalState();
  let time = state.startTime || "08:00:00";

  const handleDownloadGPX = () => {
    if (state.gpxData) {
      const gpxString = createGPX(state.gpxData, time);
      downloadGPX(gpxString, "my-tracks.gpx");
    } else {
      alert("No GPX data available to download.");
    }
  };

  const downloadGPX = (gpxString: string, filename: string) => {
    const blob = new Blob([gpxString], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button className="download-button" onClick={handleDownloadGPX}>
      <FaDownload />
      Download GPX
    </button>
  );
};

export default GPXDownloadButton;
