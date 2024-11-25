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
  trackIndex: number;
  partIndex: number;
}

const TrackPart: React.FC<TrackPartProps> = ({
  trackPart,
  trackIndex,
  partIndex,
}) => {
  const { dispatch } = useGlobalState();

  const handleMultiplierChange = (multiplier: number) => {
    // Dispatch with trackIndex, partIndex, and multiplier
    dispatch(updateDurationMultiplier(trackIndex, partIndex, multiplier));
  };

  return (
    <div className="track-part-container">
      <div className="track-part-icon">
        <FaArrowsUpDown />
      </div>
      <div className="track-part-info">
        <div>{(trackPart.distance / 1000).toFixed(1)} km</div>
        <SegmentedControl
          key={partIndex}
          options={multipliers}
          selectedValue={trackPart.durationMultiplier}
          onChange={handleMultiplierChange}
        />
        <div className="track-part-duration">
          <div className="track-part-stopwatch">
            <FaStopwatch />
          </div>
          <div>
            {formatTimeFromSeconds(
              Math.round(trackPart.travelTime * trackPart.durationMultiplier)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackPart;
