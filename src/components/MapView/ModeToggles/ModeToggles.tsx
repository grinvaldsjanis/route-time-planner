import React from "react";
import "./ModeToggles.css";

type ModeKeys = "ele" | "curve" | "slope" | "speedLimit";

interface ModeTogglesProps {
  currentMode: ModeKeys;
  onModeChange: (mode: ModeKeys) => void;
}

const ModeToggles: React.FC<ModeTogglesProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div
      className="map-buttons"
      style={{
        position: "absolute",
        top: 10,
        gap: 10,
        right: 10,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        onClick={() => onModeChange("ele")}
        className={currentMode === "ele" ? "button-active" : ""}
      >
        Elevation
      </button>
      <button
        onClick={() => onModeChange("curve")}
        className={currentMode === "curve" ? "button-active" : ""}
      >
        Curvature
      </button>
      <button
        onClick={() => onModeChange("slope")}
        className={currentMode === "slope" ? "button-active" : ""}
      >
        Slope
      </button>
      {/* <button
        onClick={() => onModeChange("speedLimit")}
        className={currentMode === "speedLimit" ? "button-active" : ""}
      >
        Speed
      </button> */}
    </div>
  );
};

export default ModeToggles;
