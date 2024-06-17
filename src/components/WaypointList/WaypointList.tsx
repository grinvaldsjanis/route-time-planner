import React from "react";
import "./WaypointList.css";
import { useGlobalState } from "../../context/GlobalContext";
import WaypointItem from "./WaypointItem/WaypointItem";
import TrackPart from "./TrackPart/TrackPart";
import { formatTimeFromSeconds } from "../../utils/timeUtils";
import formatTimeToHHMM from "../../utils/formatTimeToHHMM";

const WaypointList: React.FC = () => {
  const { state } = useGlobalState();

  if (!state.gpxData) {
    return <div>No GPX data available.</div>;
  }

  const { waypoints, trackParts } = state.gpxData;

  return (
    <div className="outer-list-container">
      <div className="inner-list-container">
        <ul>
          {waypoints.map((waypoint, index) => (
            <React.Fragment key={`waypoint-${index}`}>
              <WaypointItem index={index} />
              {index < trackParts.length && (
                <TrackPart
                  key={`trackpart-${index}`}
                  trackPart={trackParts[index]}
                  index={index}
                />
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="resulting-info">
        <div className="total-summation">
          <p>
            <strong>Distance:</strong> {state.totalDistance.toFixed(2)} km
          </p>
          <p>
            <strong>Road Time:</strong>{" "}
            {formatTimeFromSeconds(state.totalTravelTime)}
          </p>
          <p>
            <strong>Journey Time:</strong> {state.totalJourneyTime}
          </p>
        </div>
        <div className="arrival-time">
          <p>Arrival time</p>
          <div className="arrival-time-numbers">
            {formatTimeToHHMM(state.finalArrivalTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaypointList;
