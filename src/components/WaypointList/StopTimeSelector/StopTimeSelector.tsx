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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setSliderValue(localStopTimes[index]);
  }, [localStopTimes, index]);

  const debouncedHandleStopTimeChange = useCallback(
    debounce((value, idx) => {
      handleStopTimeChange(value, idx);
    }, 300), [handleStopTimeChange]
  );

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = stopTimes[parseInt(event.target.value)];
    setSliderValue(value);
    setIsDragging(true);
  };

  
  const handleSliderCommit = () => {
    if (isDragging) {
      debouncedHandleStopTimeChange(sliderValue, index);
      setIsDragging(false);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleSliderCommit();
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("touchend", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [handleSliderCommit]);

  return (
    <div className="stop-time-selector">
      <input
        type="range"
        min="0"
        max={stopTimes.length - 1}
        value={stopTimes.findIndex((time) => time === sliderValue)}
        onChange={handleSliderChange}
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
