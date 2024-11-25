import { Track } from "./types";
import calculateSpeed from "./calculateSpeed";
import travelModes from "../constants/travelModes";

const updateCalculatedSpeedsForTrack = (
  track: Track,
  modeKey: keyof typeof travelModes
): Track => {
  const updatedTrackPoints = track.points.map((point) => {
    const calculatedSpeed = calculateSpeed(point, modeKey);
    return { ...point, calculatedSpeed };
  });

  return {
    ...track,
    points: updatedTrackPoints,
  };
};

export default updateCalculatedSpeedsForTrack;
