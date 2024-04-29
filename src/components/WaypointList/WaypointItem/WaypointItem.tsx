import React, { useState, useEffect } from "react";
import formatTime from "../../../utils/formatTime";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import TimeInfo from "../TimeInfo/TimeInfo";
import { useGlobalState } from "../../../context/GlobalContext"; // Assuming you have a global context
import "./WaypointItem.css";
import { TrackPart, Waypoint } from "../../../utils/parseGPX";
import { FaArrowsUpDown } from "react-icons/fa6";
import EditableText from "../../EditableText/EditableText";

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
  const { dispatch } = useGlobalState();
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

  const stopTime = localStopTimes[index];
  const containerStyle = {
    backgroundColor: stopTime > 0 ? "rgb(214, 245, 161)" : "rgb(241, 241, 241)",
  };

  return (
    <li className="list-item">
      <div className="waypoint-container">
        <div className="item-order-number">{index + 1}</div>
        <div className="waypoint-info-container" style={containerStyle}>
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
            {showStopTimeSelector && (
              <StopTimeSelector
                index={index}
                localStopTimes={localStopTimes}
                handleStopTimeChange={handleStopTimeChange}
              />
            )}
            <TimeInfo
              index={index}
              times={times}
              waypoint={{ ...waypoint, name: editableName }}
              localStopTimes={localStopTimes}
            />
          </div>
        </div>
      </div>

      {trackPart && (
        <div className="track-part-container">
          <div className="track-part-icon">
            <FaArrowsUpDown />
          </div>
          <div className="track-part-info">
            <p>Distance: {trackPart.distance.toFixed(2)} km</p>
            <p>Duration: {formatTime(trackPart.travelTime)}</p>
          </div>
        </div>
      )}
    </li>
  );
};

export default WaypointItem;
