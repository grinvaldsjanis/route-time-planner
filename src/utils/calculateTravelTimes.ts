import { GPXData, TrackPart } from "./types";
import calculateTravelTime from "./calculateTravelTime";
import travelModes from "../constants/travelModes";

const calculateTravelTimes = (
  gpxData: GPXData,
  modeKey: keyof typeof travelModes
): TrackPart[] => {
  if (!gpxData.trackParts) {
    console.warn("trackParts is undefined");
    return [];
  }

  const updatedTrackParts = gpxData.trackParts.map((trackPart) => {
    const travelTime = calculateTravelTime(
      [trackPart],
      gpxData.tracks,
      modeKey
    );
    return {
      ...trackPart,
      travelTime: travelTime[0],
    };
  });

  return updatedTrackParts;
};

export default calculateTravelTimes;
