import React, { useCallback } from "react";
import travelModes from "../../constants/travelModes";
import { useGlobalState } from "../../context/GlobalContext";
import { setGPXName } from "../../context/actions";
import "./TravelModeSelector.css";
import TimeSelector from "../WaypointList/TimeSelector/TimeSelector";
import EditableText from "../EditableText/EditableText";

type TravelModeKey = keyof typeof travelModes;

const getTravelModeDetails = (
  mode: string
): (typeof travelModes)[TravelModeKey] => {
  return travelModes[mode as TravelModeKey] || travelModes["Casual Walking"];
};

const TravelModeSelector = React.memo(() => {
  const { state, dispatch } = useGlobalState();

  const selectedMode = getTravelModeDetails(state.travelMode);
  const gpxName = state.gpxData?.gpxName || "My Journey";

  const handleGPXNameChange = useCallback((newName: string) => {
    dispatch(setGPXName(newName));
  }, [dispatch]);

  const handleChange = (newMode: keyof typeof travelModes) => {
    if (travelModes[newMode]) {
      dispatch({ type: "SET_TRAVEL_MODE", payload: newMode });
    }
  };

  return (
    <div className="travel-setting-wrapper">
      <EditableText
        text={gpxName}
        onTextChange={handleGPXNameChange}
      />
      <div className="travel-settings">
        <div className="travel-mode-selector">
          <select
            value={state.travelMode}
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
          <div className="description">
            <ul>
              <li>Max Speed: {selectedMode.maxSpeed} km/h</li>
              <li>Handling Factor: {selectedMode.handlingFactor}</li>
              <li>Power Factor: {selectedMode.powerFactor}</li>
            </ul>
          </div>
        </div>
        <TimeSelector />
      </div>
    </div>
  );
});

export default TravelModeSelector;
