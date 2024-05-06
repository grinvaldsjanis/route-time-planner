import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import "./StopTimeSelector.css";

interface StopTimeSelectorProps {
  stopTime: number | 0;
  handleStopTimeChange: (stopTime: number) => void;
}

const StopTimeSelector: React.FC<StopTimeSelectorProps> = ({
  stopTime,
  handleStopTimeChange,
}) => {
  const timePresets = [0, 5, 10, 20, 30, 45, 60, 75, 90, 120, 150, 180];
  const [sliderValue, setSliderValue] = useState(stopTime);
  const [isDragging, setIsDragging] = useState(false);

  // Keep slider value synced with the initial stop time prop
  useEffect(() => {
    setSliderValue(stopTime);
  }, [stopTime]);

  // Use `useCallback` to memoize `handleSliderCommit`
  const handleSliderCommit = useCallback(() => {
    if (isDragging) {
      const debouncedCommit = debounce((value: number) => {
        handleStopTimeChange(value);
      }, 300);

      debouncedCommit(sliderValue);
      setIsDragging(false);
    }
  }, [isDragging, sliderValue, handleStopTimeChange]);

  // Handle slider change events
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = timePresets[parseInt(event.target.value)];
    setSliderValue(value);
    setIsDragging(true);
  };

  // Set up global event listeners for mouse/touch end events
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
        max={timePresets.length - 1}
        value={timePresets.findIndex((time) => time === sliderValue)}
        onChange={handleSliderChange}
        list="stop-times"
      />
      <datalist id="stop-times">
        {timePresets.map((time, idx) => (
          <option key={idx} value={idx}>{time} min</option>
        ))}
      </datalist>
      <div className="selected-value">{sliderValue} min</div>
    </div>
  );
};

export default StopTimeSelector;
