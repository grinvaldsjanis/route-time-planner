import React from "react";
import { FaArrowsUpDown } from "react-icons/fa6";
import { formatTimeFromSeconds } from "../../../utils/timeUtils";
import { TrackPart as TrackPartType } from "../../../utils/parseGPX";
import "./TrackPart.css";

interface TrackPartProps {
  trackPart: TrackPartType;
}

const TrackPart: React.FC<TrackPartProps> = ({ trackPart }) => {
  return (
    <div className="track-part-container">
      <div className="track-part-icon">
        <FaArrowsUpDown />
      </div>
      <div className="track-part-info">
        <p>Distance: {trackPart.distance.toFixed(1)} km</p>
        <p>Duration: {formatTimeFromSeconds(trackPart.travelTime)}</p>
      </div>
    </div>
  );
};

export default TrackPart;
