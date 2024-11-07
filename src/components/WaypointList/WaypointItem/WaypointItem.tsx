import React, { useState, useEffect } from "react";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import {
  LuArrowDownFromLine,
  LuArrowDownToLine,
  LuClock,
  LuArrowRightFromLine,
} from "react-icons/lu";
import EditableText from "../../EditableText/EditableText";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import { LatLngTuple } from "leaflet";
import {
  setMapCenter,
  setFocusedWaypoint,
  setIsProgrammaticMove,
  setMapZoom,
} from "../../../context/actions";
import {
  formatTimeFromSeconds,
  minutesToSeconds,
} from "../../../utils/timeUtils";

interface WaypointItemProps {
  index: number;
}

const WaypointItem: React.FC<WaypointItemProps> = ({ index }) => {
  const { state, dispatch } = useGlobalState();

  const [editableName, setEditableName] = useState<string>(
    `Point ${index + 1}`
  );
  const [startHour, startMinute] = state.startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  const currentTrack =
    state.gpxData && state.currentTrackIndex !== null
      ? state.gpxData.tracks[state.currentTrackIndex]
      : null;

  const trackWaypoint = currentTrack?.waypoints[index] ?? null;
  const referenceWaypoint = trackWaypoint
    ? state.gpxData?.referenceWaypoints.find(
        (refWaypoint) => refWaypoint.id === trackWaypoint.referenceId
      )
    : null;

  useEffect(() => {
    if (trackWaypoint) {
      setEditableName(referenceWaypoint?.name || `Point ${index + 1}`);
    }
  }, [referenceWaypoint, index, state.gpxData]);

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

  const formatDistance = (distance: number) => {
    return distance >= 10 ? Math.round(distance) : distance.toFixed(1);
  };

  const distanceFromStart = formatDistance(
    trackWaypoint?.distanceFromStart ?? 0
  );
  const distanceToEnd = formatDistance(trackWaypoint?.distanceToEnd ?? 0);

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
    timeInfo = (
      <div>
        <LuArrowDownFromLine /> {departureTime}
      </div>
    );
  } else if (referenceWaypoint.type === "destination") {
    timeInfo = (
      <div>
        <LuArrowDownToLine /> {arrivalTime}
      </div>
    );
  } else {
    timeInfo =
      stopTime > 0 ? (
        <div className="arrival-departure">
          <div className="time-info-row">
            <LuArrowDownToLine /> {arrivalTime}
          </div>
          <div className="time-info-row">
            <LuArrowDownFromLine /> {departureTime}
          </div>
        </div>
      ) : (
        <div className="time-info-row">
          <LuClock /> {arrivalTime}
        </div>
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
        <div className="waypoint-front-container">
          <div className="item-order-number">{index + 1}</div>
        </div>

        <div
          className={`waypoint-info-container ${isActive ? "active" : ""}`}
          id={`waypoint-info-${index}`}
          style={{
            backgroundColor:
              stopTime > 0 ? "rgb(214, 245, 161)" : "rgb(241, 241, 241)",
          }}
        >
          {referenceWaypoint.type !== "shaping" && (
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
          )}

          <div className="waypoint-time-container">
            {referenceWaypoint.type !== "start" &&
              referenceWaypoint.type !== "destination" &&
              referenceWaypoint.type !== "shaping" && (
                <StopTimeSelector
                  key={`stop-selector-${index}-${stopTime}`}
                  stopTime={stopTime}
                  handleStopTimeChange={handleStopTimeChange}
                />
              )}
            <div className="timeinfo-wrapper">{timeInfo}</div>
          </div>
          <div className="waypoint-distance-container">
            {referenceWaypoint.type !== "start" &&
              referenceWaypoint.type !== "shaping" && (
                <div className="item-distance">
                  <LuArrowRightFromLine />
                  {distanceFromStart} km
                </div>
              )}
            {referenceWaypoint.type !== "destination" &&
              referenceWaypoint.type !== "shaping" && (
                <div className="item-distance">
                  - {distanceToEnd} km
                  <LuArrowRightFromLine />
                </div>
              )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default WaypointItem;
