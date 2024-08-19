import React, { useState, useEffect } from "react";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import EditableText from "../../EditableText/EditableText";
import { LatLngTuple } from "leaflet";
import {
  setMapCenter,
  setFocusedWaypoint,
  setIsProgrammaticMove,
  setMapZoom,
} from "../../../context/actions";
import { formatTimeFromSeconds, minutesToSeconds } from "../../../utils/timeUtils";
import { TrackWaypoint, ReferenceWaypoint } from "../../../utils/types";

interface WaypointItemProps {
  index: number;
}

const WaypointItem: React.FC<WaypointItemProps> = ({ index }) => {
  const { state, dispatch } = useGlobalState();

  // Hooks must be placed at the top level
  const [editableName, setEditableName] = useState<string>(`Point ${index + 1}`);
  const [startHour, startMinute] = state.startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  // This is where we safely check if the data exists and use it accordingly
  const currentTrack = state.gpxData && state.currentTrackIndex !== null
    ? state.gpxData.tracks[state.currentTrackIndex]
    : null;

  const trackWaypoint = currentTrack?.waypoints[index] ?? null;

  const referenceWaypoint = trackWaypoint
    ? state.gpxData?.referenceWaypoints.find(
        (refWaypoint) => refWaypoint.id === trackWaypoint.referenceId
      )
    : null;

  // Set the editable name only if referenceWaypoint exists
  useEffect(() => {
    if (referenceWaypoint?.name) {
      setEditableName(referenceWaypoint.name);
    }
  }, [referenceWaypoint]);

  // Calculate arrival and departure times based on relative times
  const arrivalTime = trackWaypoint
    ? formatTimeFromSeconds(
        (trackWaypoint.relativeTimes?.arrivalSeconds ?? 0) + startTimeSeconds
      )
    : formatTimeFromSeconds(startTimeSeconds);

  const departureTime = trackWaypoint
    ? formatTimeFromSeconds(
        (trackWaypoint.relativeTimes?.departureSeconds ?? 0) + startTimeSeconds
      )
    : formatTimeFromSeconds(startTimeSeconds);

  const stopTime = trackWaypoint?.stopTime ?? 0;

  // Log to track re-rendering and state updates
  useEffect(() => {
    if (trackWaypoint) {
      console.log(
        `Waypoint ${index} - Arrival: ${arrivalTime}, Departure: ${departureTime}`
      );
    }
  }, [arrivalTime, departureTime, stopTime, trackWaypoint]);

  const handleStopTimeChange = (stopTime: number) => {
    if (trackWaypoint) {
      dispatch({ type: "UPDATE_STOP_TIME", payload: { index, stopTime } });
    }
  };

  const handleSetMapCenter = () => {
    if (referenceWaypoint) {
      const newCenter = [
        parseFloat(referenceWaypoint.lat),
        parseFloat(referenceWaypoint.lon),
      ] as LatLngTuple;
      dispatch(setIsProgrammaticMove(true));
      dispatch(setMapCenter(newCenter));
      dispatch(setFocusedWaypoint(index));
      dispatch(setMapZoom(15));
    }
  };

  const isActive = state.focusedWaypointIndex === index;

  if (!currentTrack || !trackWaypoint || !referenceWaypoint) {
    return <div>No GPX data available.</div>;
  }

  let timeInfo;
  if (referenceWaypoint.type === "start") {
    timeInfo = <div>Departure: {departureTime}</div>;
  } else if (referenceWaypoint.type === "destination") {
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
            {referenceWaypoint.type !== "start" &&
              referenceWaypoint.type !== "destination" && (
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
