import React from "react";
import { Track } from "../../utils/parseGPX";
import { calculateElevationRange } from "../../utils/calculateRange";
import "./ScaleStrip.css";
import getColorForValue from "../../utils/getColorForValue";

interface ElevationScaleProps {
  tracks: Track[];
}

const ElevationScale: React.FC<ElevationScaleProps> = ({ tracks }) => {
  const { minElevation, maxElevation } = calculateElevationRange(tracks);

  const generateElevationLabels = () => {
    const steps = 9;
    const stepValue = (maxElevation - minElevation) / steps;
    const labels = [];
    for (let i = 0; i <= steps; i++) {
      const elevation = minElevation + stepValue * i;
      labels.push({
        value: Math.round(elevation),
        color: getColorForValue(elevation, minElevation, maxElevation),
      });
    }
    return labels;
  };

  const labels = generateElevationLabels();

  // Construct the gradient string for CSS
  const gradientStops = labels
    .map(
      (label) =>
        `${label.color} ${
          ((label.value - minElevation) / (maxElevation - minElevation)) * 100
        }%`
    )
    .join(", ");
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops})`,
  };

  return (
    <div className="elevation-scale">
      <div className="elevation-gradient" style={gradientStyle} />
      <div className="elevation-labels">
        {labels.map((label, index) => (
          <span key={index}>{label.value}</span>
        ))}
      </div>
    </div>
  );
};

export default ElevationScale;
