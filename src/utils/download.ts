import { setInProgress } from "../context/actions";
import createGPX from "./createGPX";
import { GPXData } from "./types";

export const handleDownloadGPX = async (
  gpxData: GPXData | null,
  startTime: string = "08:00:00",
  gpxName: string = "My Journey",
  dispatch: (action: any) => void
) => {
  if (!gpxData) {
    console.error("No GPX data available to download.");
    return;
  }

  try {
    dispatch(setInProgress(true, "Parsing GPX content..."));

    // Call the asynchronous createGPX function
    const gpxString = await createGPX(gpxData, startTime, gpxName, dispatch);

    // Ensure progress indicator is turned off after processing
    dispatch(setInProgress(false, ""));

    // Trigger the download
    downloadGPX(gpxString, gpxName);
  } catch (error) {
    console.error("Error during GPX creation:", error);

    // Ensure progress indicator is turned off even if an error occurs
    dispatch(setInProgress(false, ""));
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
