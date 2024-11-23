import React from "react";
import createGPX from "../../utils/createGPX";
import { useGlobalState } from "../../context/GlobalContext";

const Downloader: React.FC = () => {
  const { state } = useGlobalState();
  const startTime = state.startTime || "08:00:00";
  const gpxName = state.gpxData?.gpxName || "My Journey";

  const handleDownloadGPX = () => {
    if (state.gpxData) {
      const gpxString = createGPX(state.gpxData, startTime, gpxName);
      downloadGPX(gpxString, gpxName);
    } else {
      console.error("No GPX data available to download.");
    }
  };

  const downloadGPX = (gpxString: string, rawFilename: string) => {
    const blob = new Blob([gpxString], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rawFilename}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return null;
};

export default Downloader;
