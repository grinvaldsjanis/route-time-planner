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

  const [sliderValue, setSliderValue] = useState(localStopTimes[index]);

  useEffect(() => {
    setSliderValue(localStopTimes[index]);
  }, [localStopTimes, index]); // Ensure the slider value updates with the prop changes

  const debouncedHandleStopTimeChange = useCallback(
    debounce((value, idx) => {
      handleStopTimeChange(value, idx);
    }, 300), []
  );

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = stopTimes[parseInt(event.target.value)];
    setSliderValue(value);
  };

  // Commit the final value change when the user stops dragging
  const handleSliderCommit = () => {
    const selectedIndex = stopTimes.findIndex((time) => time === sliderValue);
    debouncedHandleStopTimeChange(sliderValue, index);
  };


  return (

      <div className="stop-time-selector">
        <input
        type="range"
        min="0"
        max={stopTimes.length - 1}
        value={stopTimes.findIndex((time) => time === sliderValue)}
        onChange={handleSliderChange}
        onMouseUp={handleSliderCommit}
        onTouchEnd={handleSliderCommit}
        list="stop-times"
      />
        <datalist id="stop-times">
          {stopTimes.map((time, idx) => (
            <option key={idx} value={idx}>{time} min</option>
          ))}
        </datalist>
        <div className="selected-value">{sliderValue} min</div>
      </div>

  );
};

export default StopTimeSelector;
