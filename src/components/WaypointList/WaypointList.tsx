import React from "react";
import "./WaypointList.css";
import { useGlobalState } from "../../context/GlobalContext";
import WaypointItem from "./WaypointItem/WaypointItem";
import {  formatTimeFromSeconds } from "../../utils/timeUtils";
import formatTimeToHHMM from "../../utils/formatTimeToHHMM";

const WaypointList: React.FC = () => {
  const { state } = useGlobalState();

  return (
    <div className="outer-list-container">
      <div className="inner-list-container">
        <ul>
          {state.gpxData?.waypoints.map((waypoint, index) => (
            <WaypointItem key={`${waypoint.name}-${index}`} index={index} />
          ))}
        </ul>
      </div>
      <div className="resulting-info">
        <div className="total-summation">
          <p>
            <strong>Distance:</strong> {state.totalDistance.toFixed(2)} km
          </p>
          <p>
            <strong>Road Time:</strong> {formatTimeFromSeconds(state.totalTravelTime)}
          </p>
          <p>
            <strong>Journey Time:</strong> {state.totalJourneyTime}
          </p>
        </div>
        <div className="arrival-time">
          <p>Arrival time</p>
          <div className="arrival-time-numbers">{formatTimeToHHMM(state.finalArrivalTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default WaypointList;
