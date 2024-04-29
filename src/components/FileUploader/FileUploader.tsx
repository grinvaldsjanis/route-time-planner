import React from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa6";
import { useGlobalState } from "../../context/GlobalContext"; // Import the global state hook
import parseGPX from "../../utils/parseGPX"; // Import the GPX parsing utility
import travelModes from "../../constants/travelModes";

const FileUploader: React.FC = () => {
  const { state, dispatch } = useGlobalState(); // Use the global state

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        dispatch({ type: "CLEAR_PREVIOUS_DATA" });
        const parsedGPXData = parseGPX(text, state.travelMode as keyof typeof travelModes); // Use the current travel mode
        dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData }); // Dispatch the parsed data to the global state
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-uploader">
      <input
        className="inputfile"
        type="file"
        id="file"
        name="gpx_uploads"
        accept=".gpx"
        onChange={handleFileChange}
      />
      <label htmlFor="file"><FaUpload /><strong>Upload GPX</strong></label>
    </div>
  );
};

export default FileUploader;
