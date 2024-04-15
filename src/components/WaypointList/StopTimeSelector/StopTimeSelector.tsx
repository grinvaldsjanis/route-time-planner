import React from "react";
import "./StopTimeSelector.css";

interface StopTimeSelectorProps {
  index: number;
  localStopTimes: number[];
  handleStopTimeChange: (stopTime: number, index: number) => void;
}

const StopTimeSelector: React.FC<StopTimeSelectorProps> = ({
  index,
  localStopTimes,
  handleStopTimeChange,
}) => {
  const stopTimes = [0, 5, 10, 20, 30, 45, 60, 75, 90, 120, 150, 180];

  return (
    <div className="stop-time-wrapper">
      <div className="stop-time-selector">
        <input
          type="range"
          min="0"
          max={stopTimes.length - 1}
          value={stopTimes.findIndex((time) => time === localStopTimes[index])}
          onChange={(e) =>
            handleStopTimeChange(stopTimes[parseInt(e.target.value)], index)
          }
          list="stop-times"
        />
        <datalist id="stop-times">
          {stopTimes.map((time, idx) => (
            <option key={idx} value={idx}>
              {time} min
            </option>
          ))}
        </datalist>
        <div className="value">{localStopTimes[index]} min</div>
      </div>
    </div>
  );
};

export default StopTimeSelector;
