import React from "react";
import "./SegmentedControl.css";

interface SegmentedControlProps {
  options: number[];
  selectedValue: number;
  onChange: (value: number) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="segmented-control">
      {options.map((option) => (
        <button
          key={option}
          className={`segment ${selectedValue === option ? "selected" : ""}`}
          onClick={() => onChange(option)}
        >
          {option}x
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
