import React from "react";
import { useGlobalState } from "../../context/GlobalContext";
import { processGPXData } from "../../utils/processGPX";
import { setInProgress } from "../../context/actions";

const FileUploader: React.FC = () => {
  const { state, dispatch } = useGlobalState();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.target;
    dispatch(setInProgress(true, "Loading"));
    const file = inputElement.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          await processGPXData(text, state.travelMode, dispatch);
        } catch (error) {
          console.error("Failed to process the GPX file.", error);
        } finally {
          dispatch(setInProgress(false, ""));
          inputElement.value = ""; // Reset the file input value to allow re-uploading the same file
        }
      };
      reader.readAsText(file);
    } else {
      // Ensure we reset the value even if no file was selected
      inputElement.value = "";
      dispatch(setInProgress(false, ""));
    }
  };

  return (
    <input
      id="file-upload-input"
      type="file"
      accept=".gpx"
      onChange={handleFileChange}
      hidden
    />
  );
};

export default FileUploader;
