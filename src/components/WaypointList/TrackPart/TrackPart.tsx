import React from "react";
import { FaArrowsUpDown, FaStopwatch } from "react-icons/fa6";
import { formatTimeFromSeconds } from "../../../utils/timeUtils";
import { TrackPart as TrackPartType } from "../../../utils/types";
import "./TrackPart.css";
import { useGlobalState } from "../../../context/GlobalContext";
import { updateDurationMultiplier } from "../../../context/actions";
import SegmentedControl from "./SegmentedControl/SegmentedControl";

const multipliers = [1, 1.5, 2, 5, 7];

interface TrackPartProps {
  trackPart: TrackPartType;
  index: number;
}

const TrackPart: React.FC<TrackPartProps> = ({ trackPart, index }) => {
  const { dispatch } = useGlobalState();

  const handleMultiplierChange = (multiplier: number) => {
    dispatch(updateDurationMultiplier(index, multiplier));
  };

  return (
    <div className="track-part-container">
      <div className="track-part-icon">
        <FaArrowsUpDown />
      </div>
      <div className="track-part-info">
        <p>Distance: {trackPart.distance.toFixed(1)} km</p>
        <SegmentedControl
          key={index}
          options={multipliers}
          selectedValue={trackPart.durationMultiplier}
          onChange={handleMultiplierChange}
        />
        <div className="track-part-duration">
          <div className="track-part-stopwatch">
            <FaStopwatch />
          </div>
          <p>
            {formatTimeFromSeconds(
              trackPart.travelTime * trackPart.durationMultiplier
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackPart;
