import React from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa6";
import { useGlobalState } from "../../context/GlobalContext";
import parseGPX from "../../utils/parseGPX";
import travelModes from "../../constants/travelModes";

const FileUploader: React.FC = () => {
  const { state, dispatch } = useGlobalState();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        dispatch({ type: "CLEAR_PREVIOUS_DATA" });
        const parsedGPXData = parseGPX(text, state.travelMode as keyof typeof travelModes);
        dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
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
