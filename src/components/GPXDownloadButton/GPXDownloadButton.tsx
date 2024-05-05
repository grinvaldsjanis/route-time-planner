import React from "react";
import createGPX from "../../utils/createGPX";
import { useGlobalState } from "../../context/GlobalContext";
import { FaDownload } from "react-icons/fa6";
import "./GPXDownloadButton.css";

const reservedWindowsDeviceNames = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
];

const sanitizeFilename = (filename: string): string => {
  let sanitized = filename.replace(/[\\/:*?"<>|]/g, "_").substring(0, 255);

  const sanitizedUpper = sanitized.toUpperCase();
  if (reservedWindowsDeviceNames.includes(sanitizedUpper)) {
    sanitized = `file_${sanitized}`;
  }

  return sanitized;
};

const GPXDownloadButton: React.FC = () => {
  const { state } = useGlobalState();
  const startTime = state.startTime || "08:00:00";
  const gpxName = state.gpxData?.gpxName || "My Journey";

  const handleDownloadGPX = () => {
    if (state.gpxData) {
      const gpxString = createGPX(state.gpxData, startTime, gpxName);
      downloadGPX(gpxString, gpxName);
    } else {
      alert("No GPX data available to download.");
    }
  };

  const downloadGPX = (gpxString: string, rawFilename: string) => {
    // Add ".gpx" extension within the sanitization function
    const sanitizedFilename = `${sanitizeFilename(rawFilename)}.gpx`;
    const blob = new Blob([gpxString], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizedFilename;
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
