import { Track, TrackPart } from "./types";
import calculateTravelTime from "./calculateTravelTime";
import travelModes from "../constants/travelModes";

const calculateTravelTimes = (
  tracks: Track[],
  modeKey: keyof typeof travelModes
): TrackPart[] => {
  const updatedTracks = tracks.map((track) => {
    if (!track.parts) {
      console.warn("track parts is undefined");
      return track;
    }

    const updatedTrackParts = track.parts.map((trackPart) => {
      const travelTime = calculateTravelTime(
        trackPart,
        track,
        modeKey
      );
      return {
        ...trackPart,
        travelTime,
      };
    });

    return {
      ...track,
      parts: updatedTrackParts,
    };
  });

  return updatedTracks.flatMap(track => track.parts);
};

export default calculateTravelTimes;
