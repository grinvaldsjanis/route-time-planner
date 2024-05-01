import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../context/GlobalContext";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
import "./ScaleStrip.css";

const ScaleStrip: React.FC = () => {
  const { state } = useGlobalState();
  const { gpxData, mapMode } = state;
  const tracks = gpxData?.tracks;

  const [range, setRange] = useState({ minValue: 0, maxValue: 100 });

  useEffect(() => {
    if (!tracks || !mapMode) {
      setRange({ minValue: 0, maxValue: 100 });
      return;
    }

    const modeKey =
      mapMode === "curve" ? "curve" : mapMode === "slope" ? "slope" : "ele";
    const defaultValue = modeKey === "curve" ? 1000 : 0;
    const { minValue, maxValue } = calculateValueRange(
      tracks,
      modeKey,
      defaultValue
    );

    setRange({ minValue, maxValue });
  }, [mapMode, tracks]);

  const generateLabels = () => {
    const steps = 9;
    const stepValue = (range.maxValue - range.minValue) / steps;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = range.minValue + stepValue * i;
      return {
        value: Math.round(value),
        color: getColorForValue(value, range.minValue, range.maxValue, mapMode === "curve" ),
      };
    });
  };

  const labels = generateLabels();
  const gradientStops = labels
    .map(
      (label) =>
        `${label.color} ${
          ((label.value - range.minValue) / (range.maxValue - range.minValue)) *
          100
        }%`
    )
    .join(", ");
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops})`,
  };

  return (
    <div className="scale-strip">
      <div className="gradient-strip" style={gradientStyle} />
      <div className="scale-labels">
        {labels.map((label, index) => (
          <span key={index}>{label.value}</span>
        ))}
      </div>
    </div>
  );
};

export default ScaleStrip;
