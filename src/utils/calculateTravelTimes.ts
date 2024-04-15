import { GPXData, TrackPart } from "./parseGPX";
import calculateTravelTime from "./calculateTravelTime";
import travelModes from "../constants/travelModes";

const calculateTravelTimes = (
    gpxData: GPXData,
    modeKey: keyof typeof travelModes
  ): TrackPart[] => {
    const updatedTrackParts = gpxData.trackParts.map(trackPart => {
      const travelTime = calculateTravelTime([trackPart], gpxData.tracks, modeKey);
      return {
        ...trackPart,
        travelTime: travelTime[0]
      };
    });
  
    return updatedTrackParts;
};

export default calculateTravelTimes;
