import { Dispatch } from "react";
import { calculateBoundsFromTrack } from "./calculateBoundsFromTrack";
import parseGPX from "./parseGPX";
import { clearPreviousData, setInProgress } from "../context/actions";
import { TravelMode } from "../constants/travelModes";

export const processGPXData = async (
  gpxContent: string,
  travelMode: TravelMode,
  dispatch: Dispatch<any>
) => {
  try {
    dispatch(clearPreviousData());
    dispatch(setInProgress(true, "Processing GPX"));

    const parsedGPXData = await parseGPX(gpxContent, travelMode, dispatch);

    dispatch({ type: "SET_GPX_DATA", payload: parsedGPXData });

    if (parsedGPXData.tracks?.length) {
      const allTrackPoints = parsedGPXData.tracks.flatMap(
        (track) => track.points
      );

      const calculatedBounds = calculateBoundsFromTrack(allTrackPoints);

      if (calculatedBounds) {
        dispatch({ type: "SET_MAP_BOUNDS", payload: calculatedBounds });

        dispatch({
          type: "SET_PROGRAMMATIC_ACTION",
          payload: "fitBounds",
        });
      }
    }
  } catch (error) {
    console.error("Error processing GPX data:", error);
    throw new Error("Failed to process the GPX file.");
  } finally {
    dispatch(setInProgress(false, ""));
  }
};
