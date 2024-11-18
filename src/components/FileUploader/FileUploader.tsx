import React, { useState } from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa";
import { useGlobalState } from "../../context/GlobalContext";
import { processGPXData } from "../../utils/processGPX";

const FileUploader: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          await processGPXData(text, state.travelMode, dispatch);
          setUploadError(null);
        } catch (error) {
          setUploadError("Failed to process the GPX file.");
        } finally {
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("file-upload-input")?.click();
  };

  return (
    <div className="file-uploader">
      <input
        id="file-upload-input"
        className="inputfile"
        type="file"
        name="gpx_uploads"
        accept=".gpx"
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="upload-button"
        onClick={handleButtonClick}
      >
        <FaUpload />
        Upload GPX
      </button>
      {uploadError && <div className="error-message">{uploadError}</div>}
    </div>
  );
};

export default FileUploader;
