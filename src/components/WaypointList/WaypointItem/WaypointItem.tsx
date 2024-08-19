import React, { useEffect, useState } from "react";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import EditableText from "../../EditableText/EditableText";
import { debounce } from "lodash";
import { LatLngTuple } from "leaflet";
import {
  setMapCenter,
  setFocusedWaypoint,
  setIsProgrammaticMove,
  setMapZoom,
} from "../../../context/actions";
import { formatTimeFromSeconds, minutesToSeconds } from "../../../utils/timeUtils";
import { Track } from "../../../utils/types";

interface WaypointItemProps {
  index: number;
  currentTrack: Track;
}

const WaypointItem: React.FC<WaypointItemProps> = ({ index, currentTrack }) => {
  const { state, dispatch } = useGlobalState();

  // Get the waypoint from the current track using the provided index
  const trackWaypoint = currentTrack.waypoints[index];

  const waypoint = state.gpxData?.referenceWaypoints.find(
    (refWaypoint) => refWaypoint.id === trackWaypoint?.referenceId
  );

  const [editableName, setEditableName] = useState<string>(
    waypoint?.name || `Point ${index + 1}`
  );

  const stopTime = trackWaypoint?.stopTime ?? 0;

  const [startHour, startMinute] = state.startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  let arrivalTime = formatTimeFromSeconds(startTimeSeconds);
  let departureTime = formatTimeFromSeconds(startTimeSeconds);

  if (trackWaypoint?.relativeTimes) {
    arrivalTime = formatTimeFromSeconds(
      trackWaypoint.relativeTimes.arrivalSeconds + startTimeSeconds
    );
    departureTime = formatTimeFromSeconds(
      trackWaypoint.relativeTimes.departureSeconds + startTimeSeconds
    );
  }

  // Effect to update the name and time when the track or waypoint changes
  useEffect(() => {
    if (waypoint?.name) {
      setEditableName(waypoint.name);
    } else {
      setEditableName(`Point ${index + 1}`);
    }

    // Recalculate arrival and departure times when track changes
    if (trackWaypoint?.relativeTimes) {
      arrivalTime = formatTimeFromSeconds(
        trackWaypoint.relativeTimes.arrivalSeconds + startTimeSeconds
      );
      departureTime = formatTimeFromSeconds(
        trackWaypoint.relativeTimes.departureSeconds + startTimeSeconds
      );
    }
  }, [currentTrack, trackWaypoint, waypoint, startTimeSeconds]);

  let timeInfo;
  if (waypoint?.type === "start") {
    timeInfo = <div>Departure: {departureTime}</div>;
  } else if (waypoint?.type === "destination") {
    timeInfo = <div>Arrival: {arrivalTime}</div>;
  } else {
    timeInfo =
      stopTime > 0 ? (
        <div className="arrival-departure">
          <div>Arrival: {arrivalTime}</div>
          <div>Departure: {departureTime}</div>
        </div>
      ) : (
        <div>Pass: {arrivalTime}</div>
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
      dispatch(setMapZoom(15));
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
                dispatch({
                  type: "SET_WAYPOINT_NAME",
                  payload: { index, name: newName },
                });
              }}
            />
          </div>
          <div className="waypoint-time-container">
            {waypoint?.type !== "start" &&
              waypoint?.type !== "destination" && (
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
    </li>
  );
};

export default WaypointItem;
