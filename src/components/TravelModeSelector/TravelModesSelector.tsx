import React, { useCallback, useState } from "react";
import travelModes from "../../constants/travelModes";
import { useGlobalState } from "../../context/GlobalContext";
import { setGPXName } from "../../context/actions";
import "./TravelModeSelector.css";
import TimeSelector from "../WaypointList/TimeSelector/TimeSelector";
import EditableText from "../EditableText/EditableText";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

type TravelModeKey = keyof typeof travelModes;

const getTravelModeDetails = (
  mode: string
): (typeof travelModes)[TravelModeKey] => {
  return travelModes[mode as TravelModeKey] || travelModes["Casual Walking"];
};

const TravelModeSelector = React.memo(() => {
  const { state, dispatch } = useGlobalState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const gpxName = state.gpxData?.gpxName || "My Journey";
  const tracks = state.gpxData?.tracks || [];
  const currentTrackIndex = state.currentTrackIndex ?? 0;

  const selectedModeDetails = getTravelModeDetails(state.travelMode);

  const selectedMode = {
    label: state.travelMode,
    IconComponent: selectedModeDetails.IconComponent,
    iconColor: selectedModeDetails.iconColor,
  };

  const handleGPXNameChange = useCallback(
    (newName: string) => {
      dispatch(setGPXName(newName));
    },
    [dispatch]
  );

  const handleChangeMode = (newMode: TravelModeKey) => {
    if (travelModes[newMode]) {
      dispatch({ type: "SET_TRAVEL_MODE", payload: newMode });
    }
    setIsDropdownOpen(false); // Close the dropdown after selection
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
          <DropdownMenu
            selectedMode={selectedMode}
            isOpen={isDropdownOpen}
            travelModes={travelModes}
            onToggle={() => setIsDropdownOpen((prev) => !prev)}
            onSelect={(mode) => handleChangeMode(mode as TravelModeKey)} // Ensure proper typing
          />

          {/* Mode details */}
          <div className="description">
            <ul>
              <li>Max Speed: {selectedModeDetails.maxSpeed} km/h</li>
              <li>Handling Factor: {selectedModeDetails.handlingFactor}</li>
              <li>Power Factor: {selectedModeDetails.powerFactor}</li>
            </ul>
          </div>
        </div>
        <TimeSelector />
      </div>
    </div>
  );
});

export default TravelModeSelector;
