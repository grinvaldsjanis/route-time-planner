// WaypointList.tsx
import React from "react";
import "./WaypointList.css";
import { useGlobalState } from "../../context/GlobalContext";
import WaypointItem from "./WaypointItem/WaypointItem";
import TrackPart from "./TrackPart/TrackPart";
import { formatTimeFromSeconds } from "../../utils/timeUtils";
import formatTimeToHHMM from "../../utils/formatTimeToHHMM";

const WaypointList: React.FC = () => {
  const { state } = useGlobalState();

  // Check if GPX data and current track index are valid
  if (!state.gpxData || state.currentTrackIndex === null) {
    return <div>No GPX data available.</div>;
  }

  const currentTrack = state.gpxData.tracks[state.currentTrackIndex];

  // Check if the current track and its waypoints are valid
  if (!currentTrack || !currentTrack.waypoints || currentTrack.waypoints.length === 0) {
    return <div>No waypoints available for the current track.</div>;
  }

  const waypoints = currentTrack.waypoints;
  const trackParts = currentTrack.parts || [];

  return (
    <div className="outer-list-container">
      <div className="inner-list-container">
        <ul>
          {waypoints.map((waypoint, index) => (
            <React.Fragment key={`waypoint-${index}`}>
              <WaypointItem index={index} currentTrack={currentTrack} />
              {index < trackParts.length && state.currentTrackIndex !== null && (
                <TrackPart
                  key={`trackpart-${index}`}
                  trackPart={trackParts[index]}
                  trackIndex={state.currentTrackIndex!}
                  partIndex={index}
                />
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="resulting-info">
        <div className="total-summation">
          <div>
            <strong>Distance:</strong> {state.totalDistance.toFixed(2)} km
          </div>
          <div>
            <strong>Road Time:</strong>{" "}
            {formatTimeFromSeconds(state.totalTravelTime)}
          </div>
          <div>
            <strong>Journey Time:</strong> {state.totalJourneyTime}
          </div>
        </div>
        <div className="arrival-time">
          <div>Arrival time</div>
          <div className="arrival-time-numbers">
            {formatTimeToHHMM(state.finalArrivalTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaypointList;
