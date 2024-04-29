import React from "react";
import travelModes from "../../constants/travelModes";
import { useGlobalState } from "../../context/GlobalContext";
import "./TravelModeSelector.css";

type TravelModeKey = keyof typeof travelModes;

const getTravelModeDetails = (mode: string): typeof travelModes[TravelModeKey] => {
  return travelModes[mode as TravelModeKey] || travelModes["Casual Walking"];
};

const TravelModeSelector = React.memo(() => {
  const { state, dispatch } = useGlobalState();
  
  // Ensure the selected mode is valid or fall back to a default
  const selectedMode = getTravelModeDetails(state.travelMode);

  const handleChange = (newMode: keyof typeof travelModes) => {
    if (travelModes[newMode]) {  // Ensure the new mode is actually valid
      dispatch({ type: "SET_TRAVEL_MODE", payload: newMode });
    }
  };

  return (
    <div className="travel-mode-selector">
      <select
        value={state.travelMode}
        onChange={(e) => handleChange(e.target.value as keyof typeof travelModes)}
      >
        {Object.keys(travelModes).map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
      <div className="description">
        <ul>
          <li>Max Speed: {selectedMode.maxSpeed} km/h</li>
          <li>Handling Factor: {selectedMode.handlingFactor}</li>
          <li>Power Factor: {selectedMode.powerFactor}</li>
        </ul>
      </div>
    </div>
  );
});

export default TravelModeSelector;
