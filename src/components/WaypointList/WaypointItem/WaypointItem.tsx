import React, { useState, useEffect, useCallback } from "react";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import TimeInfo from "../TimeInfo/TimeInfo";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import { TrackPart, Waypoint } from "../../../utils/parseGPX";
import { FaArrowsUpDown } from "react-icons/fa6";
import EditableText from "../../EditableText/EditableText";
import { formatTimeFromSeconds } from "../../../utils/timeUtils";

interface WaypointItemProps {
  waypoint: Waypoint;
  index: number;
  times: {
    arrival: string[];
    departure: string[];
  };
  handleStopTimeChange: (stopTime: number, index: number) => void;
  showStopTimeSelector: boolean;
  localStopTimes: number[];
  trackPart?: TrackPart;
}

const WaypointItem: React.FC<WaypointItemProps> = ({
  waypoint,
  index,
  times,
  handleStopTimeChange,
  showStopTimeSelector,
  localStopTimes,
  trackPart,
}) => {
  const { state, dispatch } = useGlobalState();
  const [editableName, setEditableName] = useState<string>(
    waypoint.name || `Point ${index + 1}`
  );

  useEffect(() => {
    const storedWaypointName =
      localStorage.getItem(`waypointName_${index}`) ||
      waypoint.name ||
      `Point ${index + 1}`;
    setEditableName(storedWaypointName);
  }, [index, waypoint.name]);

  useEffect(() => {
    if (state.focusedWaypointIndex === index) {
      const element = document.getElementById(`waypoint-info-${index}`);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      element?.classList.add("highlighted");

      return () => {
        element?.classList.remove("highlighted");
      };
    }
  }, [state.focusedWaypointIndex, index]);

  const handleChangeStopTime = useCallback(
    (newStopTime: number, idx: number) => {
      handleStopTimeChange(newStopTime, idx);
    },
    [handleStopTimeChange]
  );

  return (
    <li
      className="list-item"
      id={`waypoint-${index}`}
      key={`waypoint-${index}`}
    >
      <div className="waypoint-container">
        <div className="item-order-number">{index + 1}</div>
        <div
          className="waypoint-info-container"
          id={`waypoint-info-${index}`}
          style={{
            backgroundColor:
              localStopTimes[index] > 0
                ? "rgb(214, 245, 161)"
                : "rgb(241, 241, 241)",
          }}
        >
          <div className="item-top-row">
            <div className="item-name">
              <EditableText
                text={editableName}
                onTextChange={(newName) => {
                  setEditableName(newName);
                  localStorage.setItem(`waypointName_${index}`, newName);
                  dispatch({
                    type: "SET_WAYPOINT_NAME",
                    payload: { index, name: newName },
                  });
                }}
              />
            </div>
          </div>
          <div className="waypoint-time-container">
            <div className="stoptime-wrapper">
              {showStopTimeSelector && (
                <StopTimeSelector
                  key={`stop-selector-${index}-${localStopTimes[index]}`}
                  index={index}
                  localStopTimes={localStopTimes}
                  handleStopTimeChange={handleChangeStopTime}
                />
              )}
            </div>

            <div className="timeinfo-wrapper">
              <TimeInfo
                key={`time-info-${index}-${localStopTimes[index]}`}
                index={index}
                times={times}
                waypoint={{ ...waypoint, name: editableName }}
                localStopTimes={localStopTimes}
              />
            </div>
          </div>
        </div>
      </div>
      {trackPart && (
        <div className="track-part-container">
          <div className="track-part-icon">
            <FaArrowsUpDown />
          </div>
          <div className="track-part-info">
            <p>Distance: {trackPart.distance.toFixed(1)} km</p>
            <p>Duration: {formatTimeFromSeconds(trackPart.travelTime)}</p>
          </div>
        </div>
      )}
    </li>
  );
};

export default WaypointItem;
