import React, { useCallback, useState } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectedMode = getTravelModeDetails(state.travelMode);
  const gpxName = state.gpxData?.gpxName || "My Journey";
  const tracks = state.gpxData?.tracks || [];
  const currentTrackIndex = state.currentTrackIndex ?? 0;

  const handleGPXNameChange = useCallback(
    (newName: string) => {
      dispatch(setGPXName(newName));
    },
    [dispatch]
  );

  const handleChangeMode = (newMode: keyof typeof travelModes) => {
    if (travelModes[newMode]) {
      dispatch({ type: "SET_TRAVEL_MODE", payload: newMode });
    }
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTrackIndex = parseInt(e.target.value, 10);
    if (!isNaN(selectedTrackIndex)) {
      dispatch({
        type: "SET_CURRENT_TRACK_INDEX",
        payload: selectedTrackIndex,
      });
    }
  };

  return (
    <div className="travel-setting-wrapper">
      {/* Editable GPX Name */}
      <EditableText text={gpxName} onTextChange={handleGPXNameChange} />

      {/* Track Selector */}
      {tracks.length > 1 && (
        <div className="track-selector">
          <select
            id="trackSelector"
            value={currentTrackIndex}
            onChange={handleTrackChange}
          >
            {tracks.map((track, index) => (
              <option key={index} value={index}>
                {track.name || `Track ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Travel Mode Selector */}
      <div className="travel-settings">
        <div className="travel-mode-selector">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="dropdown-toggle"
          >
            {React.createElement(selectedMode.IconComponent, {
              color: selectedMode.iconColor,
              style: { marginRight: "8px", verticalAlign: "middle" },
            })}
            {state.travelMode}{" "}
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {Object.entries(travelModes).map(([mode, details]) => (
                <div
                  key={mode}
                  className="dropdown-item"
                  onClick={() => handleChangeMode(mode as TravelModeKey)}
                >
                  {React.createElement(details.IconComponent, {
                    color: details.iconColor,
                    style: { marginRight: "8px", verticalAlign: "middle" },
                  })}
                  {mode}
                </div>
              ))}
            </div>
          )}

          {/* Mode details */}
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
