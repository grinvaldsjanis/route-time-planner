import React, { useState } from "react";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import { FaArrowsUpDown } from "react-icons/fa6";
import EditableText from "../../EditableText/EditableText";
import {
  formatTimeFromSeconds,
  minutesToSeconds,
} from "../../../utils/timeUtils";
import { debounce } from "lodash";
import { LatLngTuple } from "leaflet";
import {
  setMapCenter,
  setFocusedWaypoint,
  setIsProgrammaticMove,
} from "../../../context/actions";

interface WaypointItemProps {
  index: number;
}

const WaypointItem: React.FC<WaypointItemProps> = ({ index }) => {
  const { state, dispatch } = useGlobalState();

  const trackPart = state.gpxData?.trackParts?.[index];
  const waypoint = state.gpxData?.waypoints[index];
  const [editableName, setEditableName] = useState<string>(
    waypoint?.name || `Point ${index + 1}`
  );

  const stopTime = waypoint?.stopTime ?? 0;

  const [startHour, startMinute] = state.startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  let arrivalTime = formatTimeFromSeconds(startTimeSeconds);
  let departureTime = formatTimeFromSeconds(startTimeSeconds);

  if (waypoint?.relativeTimes) {
    arrivalTime = formatTimeFromSeconds(
      waypoint.relativeTimes.arrivalSeconds + startTimeSeconds
    );
    departureTime = formatTimeFromSeconds(
      waypoint.relativeTimes.departureSeconds + startTimeSeconds
    );
  }

  let timeInfo;
  if (waypoint?.type === "start") {
    timeInfo = <p>Departure: {departureTime}</p>;
  } else if (waypoint?.type === "destination") {
    timeInfo = <p>Arrival: {arrivalTime}</p>;
  } else {
    timeInfo =
      stopTime > 0 ? (
        <div className="arrival-departure">
          <p>Arrival: {arrivalTime}</p>
          <p>Departure: {departureTime}</p>
        </div>
      ) : (
        <p>Pass: {arrivalTime}</p>
      );
  }

  const debouncedHandleStopTimeChange = debounce((stopTime: number) => {
    dispatch({ type: "UPDATE_STOP_TIME", payload: { index, stopTime } });
  }, 300);

  const handleStopTimeChange = (stopTime: number) => {
    debouncedHandleStopTimeChange(stopTime);
  };

  const handleSetMapCenter = () => {
    if (waypoint) {
      const newCenter = [
        parseFloat(waypoint.lat),
        parseFloat(waypoint.lon),
      ] as LatLngTuple;
      dispatch(setIsProgrammaticMove(true));
      dispatch(setMapCenter(newCenter));
      dispatch(setFocusedWaypoint(index));
    }
  };

  const isActive = state.focusedWaypointIndex === index;

  return (
    <li
      className="list-item"
      id={`waypoint-${index}`}
      key={`waypoint-${index}`}
      onClick={handleSetMapCenter}
    >
      <div className="waypoint-container">
        <div className="item-order-number">{index + 1}</div>
        <div
          className={`waypoint-info-container ${isActive ? "active" : ""}`}
          id={`waypoint-info-${index}`}
          style={{
            backgroundColor:
              stopTime > 0 ? "rgb(214, 245, 161)" : "rgb(241, 241, 241)",
          }}
        >
          <div className="item-top-row">
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
          <div className="waypoint-time-container">
            {waypoint?.type !== "start" && waypoint?.type !== "destination" && (
              <StopTimeSelector
                key={`stop-selector-${index}-${stopTime}`}
                stopTime={stopTime}
                handleStopTimeChange={handleStopTimeChange}
              />
            )}
            <div className="timeinfo-wrapper">{timeInfo}</div>
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
