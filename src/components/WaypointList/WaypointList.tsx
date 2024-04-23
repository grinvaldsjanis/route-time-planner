import React, { useCallback, useEffect, useState } from "react";
import "./WaypointList.css";
import { Waypoint, TrackPart } from "../../utils/parseGPX";
import formatTime from "../../utils/formatTime";
import { useGlobalState } from "../../context/GlobalContext";
import { addTimes, convertMinutesToHHMMSS } from "../../utils/addTimes";
import WaypointItem from "./WaypointItem/WaypointItem";
import { debounce } from "lodash";

interface WaypointListProps {
  waypoints: Waypoint[];
  trackParts: TrackPart[];
}

const WaypointList: React.FC<WaypointListProps> = ({
  waypoints,
  trackParts,
}) => {
  const { state, dispatch } = useGlobalState();
  const [totalJourneyTime, setTotalJourneyTime] = useState<string>("");
  const [times, setTimes] = useState<{
    arrival: string[];
    departure: string[];
  }>({ arrival: [], departure: [] });
  const [localStopTimes, setLocalStopTimes] = useState<number[]>(
    waypoints.map((w) => w.stopTime || 0)
  );

  const totalDistance = trackParts.reduce(
    (acc, part) => acc + part.distance,
    0
  );
  const totalTravelTime = trackParts.reduce(
    (acc, part) => acc + part.travelTime,
    0
  );

  useEffect(() => {
    if (!trackParts || trackParts.length === 0) {
      console.warn("No track parts available");
      return;
    }

    const startJourneyTime = "08:00:00";
    let currentTime = startJourneyTime;
    const arrivalTimes: string[] = [];
    const departureTimes: string[] = [startJourneyTime]; // Start with initial departure time
    let totalMinutes = 0; // Initialize total minutes for the entire journey

    waypoints.forEach((waypoint, index) => {
      if (index > 0) {
        // Calculate travel time to this waypoint
        const travelMinutes = trackParts[index - 1].travelTime / 60;
        currentTime = addTimes(
          currentTime,
          convertMinutesToHHMMSS(travelMinutes)
        );
        arrivalTimes[index] = currentTime; // Arrival time at current waypoint
        totalMinutes += travelMinutes;
      }

      // Stop time at current waypoint
      const stopMinutes = localStopTimes[index];
      currentTime = addTimes(currentTime, convertMinutesToHHMMSS(stopMinutes));
      totalMinutes += stopMinutes;

      if (index < waypoints.length - 1) {
        departureTimes[index] = currentTime; // Set departure time for the next waypoint
      }

      // console.log(`Waypoint ${index}: Arrival at ${arrivalTimes[index]}, Departure at ${departureTimes[index]}, Current Time ${currentTime}`);
    });

    setTimes({ arrival: arrivalTimes, departure: departureTimes });
    setTotalJourneyTime(convertMinutesToHHMMSS(totalMinutes));
  }, [waypoints, trackParts, localStopTimes]);

  const debouncedUpdateStopTime = useCallback(
    debounce((stopTime: number, index: number) => {
      dispatch({ type: "UPDATE_STOP_TIME", payload: { index, stopTime } });
    }, 300),
    [dispatch]
  );

  const handleStopTimeChange = (stopTime: number, index: number) => {
    const newStopTimes = [...localStopTimes];
    newStopTimes[index] = stopTime;
    setLocalStopTimes(newStopTimes);
    debouncedUpdateStopTime(stopTime, index);
  };

  return (
    <div className="outer-list-container">
      <div className="inner-list-container">
        <ul>
          {waypoints.map((waypoint, index) => (
            <WaypointItem
              key={index}
              index={index}
              waypoint={waypoint}
              times={times}
              localStopTimes={localStopTimes}
              handleStopTimeChange={handleStopTimeChange}
              showStopTimeSelector={index > 0 && index < waypoints.length - 1}
              trackPart={trackParts[index] ? trackParts[index] : undefined}
            />
          ))}
        </ul>
      </div>
      <div className="total-summation">
        <p>
          <strong>Distance:</strong> {totalDistance.toFixed(2)} km
        </p>
        <p>
          <strong>Road Time:</strong> {formatTime(totalTravelTime)}
        </p>
        <p>
          <strong>Journey Time:</strong> {totalJourneyTime}
        </p>
      </div>
    </div>
  );
};

export default WaypointList;
