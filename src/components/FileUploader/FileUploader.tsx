import React, { useState } from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa";
import { useGlobalState } from "../../context/GlobalContext";
import parseGPX from "../../utils/parseGPX";
import { clearPreviousData, setInProgress } from "../../context/actions";

const FileUploader: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(clearPreviousData());
      dispatch(setInProgress(true, "Loading GPX file"));
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          dispatch(clearPreviousData());
          dispatch(setInProgress(true, "Processing GPX data"));
          const parsedGPXData = await parseGPX(text, state.travelMode);
          dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
          setUploadError(null);
        } catch (error) {
          console.error("Error parsing GPX file:", error);
          setUploadError("Failed to process the GPX file.");
        } finally {
          dispatch(setInProgress(false, ""));
          event.target.value = "";
        }
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
      <label htmlFor="file">
        <FaUpload />
        <strong>Upload GPX</strong>
      </label>
      {uploadError && <div className="error-message">{uploadError}</div>}
    </div>
  );
};

export default FileUploader;
