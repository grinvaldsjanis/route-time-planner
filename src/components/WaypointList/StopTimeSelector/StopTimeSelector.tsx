import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
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

  // Local state to manage slider position for responsiveness
  const [sliderValue, setSliderValue] = useState(localStopTimes[index]);

  // Update local state when localStopTimes change
  useEffect(() => {
    setSliderValue(localStopTimes[index]);
  }, [localStopTimes, index]); // Ensure the slider value updates with the prop changes

  // Debounce the external change handler
  const debouncedHandleStopTimeChange = useCallback(
    debounce((value, idx) => {
      handleStopTimeChange(value, idx);
    }, 300), []
  );

  // Update local state immediately, and debounce the external update
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = stopTimes[parseInt(event.target.value)];
    setSliderValue(value);
    debouncedHandleStopTimeChange(value, index);
  };

  return (
    <div className="stop-time-wrapper">
      <div className="stop-time-selector">
        <input
          type="range"
          min="0"
          max={stopTimes.length - 1}
          value={stopTimes.findIndex((time) => time === sliderValue)}
          onChange={handleChange}
          list="stop-times"
        />
        <datalist id="stop-times">
          {stopTimes.map((time, idx) => (
            <option key={idx} value={idx}>{time} min</option>
          ))}
        </datalist>
        <div className="value">{sliderValue} min</div>
      </div>
    </div>
  );
};

export default StopTimeSelector;
