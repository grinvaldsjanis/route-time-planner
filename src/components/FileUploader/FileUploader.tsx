import React from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa6";
import { useGlobalState } from "../../context/GlobalContext";
import parseGPX from "../../utils/parseGPX";
import { clearPreviousData, setInProgress } from "../../context/actions";

const FileUploader: React.FC = () => {
  const { dispatch } = useGlobalState();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      dispatch(setInProgress(true, "Loading"));
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          dispatch(clearPreviousData());
          dispatch(setInProgress(true, "Processing GPX"));
          const parsedGPXData = await parseGPX(text);
          dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });
        } catch (error) {
          console.error("Error parsing GPX file:", error);
        } finally {
          dispatch(setInProgress(false, ""));
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
    </div>
  );
};

export default FileUploader;
