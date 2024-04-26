import React from "react";
import travelModes from "../../constants/travelModes";
import { useGlobalState } from "../../context/GlobalContext";
import "./TravelModeSelector.css";

const TravelModeSelector: React.FC = () => {
  const { state, dispatch } = useGlobalState();

  const selectedMode = travelModes[state.travelMode]
    ? state.travelMode
    : "Casual Walking";

  const handleChange = (newMode: keyof typeof travelModes) => {
    dispatch({ type: "SET_TRAVEL_MODE", payload: newMode });
  };

  return (
    <div className="travel-mode-selector">
      <select
        value={selectedMode}
        onChange={(e) =>
          handleChange(e.target.value as keyof typeof travelModes)
        }
      >
        {Object.keys(travelModes).map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
      {travelModes[selectedMode] && (
        <div className="description">
          <ul>
            <li>Max Speed: {travelModes[selectedMode].maxSpeed} km/h</li>
            <li>Handling Factor: {travelModes[selectedMode].handlingFactor}</li>
            <li>Power Factor: {travelModes[selectedMode].powerFactor}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TravelModeSelector;