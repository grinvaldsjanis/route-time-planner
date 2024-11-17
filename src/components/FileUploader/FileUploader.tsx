import React, { useState } from "react";
import "./FileUploader.css";
import { FaUpload } from "react-icons/fa";
import { useGlobalState } from "../../context/GlobalContext";
import parseGPX from "../../utils/parseGPX";
import { clearPreviousData, setInProgress } from "../../context/actions";
import { calculateBoundsFromTrack } from "../../utils/calculateBoundsFromTrack";

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
          dispatch(setInProgress(true, "Processing GPX"));

          const parsedGPXData = await parseGPX(
            text,
            state.travelMode,
            dispatch
          );

          dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });

          if (parsedGPXData.tracks?.length) {
            const allTrackPoints = parsedGPXData.tracks.flatMap(
              (track) => track.points
            );

            const calculatedBounds = calculateBoundsFromTrack(allTrackPoints);

            if (calculatedBounds) {
              console.log("Dispatching calculated bounds:", calculatedBounds);
              dispatch({ type: "SET_MAP_BOUNDS", payload: calculatedBounds });

              if (!state.programmaticAction) {
                dispatch({
                  type: "SET_PROGRAMMATIC_ACTION",
                  payload: "fitBounds",
                });
              }
            }
          }
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
