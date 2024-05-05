import React, { useEffect, useState } from "react";
import "./WaypointList.css";
import { useGlobalState } from "../../context/GlobalContext";
import WaypointItem from "./WaypointItem/WaypointItem";
import { debounce } from "lodash";
import { formatTimeFromSeconds, minutesToSeconds } from "../../utils/timeUtils";
import formatTimeToHHMM from "../../utils/formatTimeToHHMM";

const WaypointList: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [totalJourneyTime, setTotalJourneyTime] = useState<string>("");
  const [times, setTimes] = useState<{
    arrival: string[];
    departure: string[];
  }>({
    arrival: [],
    departure: [],
  });
  const [localStopTimes, setLocalStopTimes] = useState<number[]>([]);
  const [finalArrivalTime, setFinalArrivalTime] = useState("");

  useEffect(() => {
    if (state.gpxData?.waypoints) {
      state.gpxData.waypoints.forEach((waypoint, index) => {
        localStorage.setItem(
          `waypointName_${index}`,
          waypoint.name || `Waypoint ${index + 1}`
        );
      });
      setLocalStopTimes(state.gpxData.waypoints.map((w) => w.stopTime || 0));
    }
  }, [state.gpxData?.waypoints]);

  const totalDistance =
    state.gpxData?.trackParts?.reduce((acc, part) => acc + part.distance, 0) ||
    0;
  const totalTravelTime =
    state.gpxData?.trackParts?.reduce(
      (acc, part) => acc + part.travelTime,
      0
    ) || 0;

  useEffect(() => {
    const gpxData = state.gpxData;
    if (!gpxData || !gpxData.trackParts || !gpxData.waypoints) {
      console.warn("No track parts or waypoints available");
      return;
    }

    let currentSeconds = 0;
    const arrivalSeconds: number[] = [];
    const departureSeconds: number[] = [];
    let totalJourneySeconds = 0;

    gpxData.waypoints.forEach((waypoint, index) => {
      if (index > 0) {
        currentSeconds += gpxData.trackParts[index - 1].travelTime;
      }
      arrivalSeconds.push(currentSeconds);

      const stopTimeSeconds = minutesToSeconds(localStopTimes[index] || 0);
      const departureTime = currentSeconds + stopTimeSeconds;
      departureSeconds.push(departureTime);

      currentSeconds = departureTime;
    });

    const [startHour, startMinute] = state.startTime.split(":").map(Number);
    const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

    const formattedArrivals = arrivalSeconds.map((sec) =>
      formatTimeFromSeconds(sec + startTimeSeconds)
    );
    const formattedDepartures = departureSeconds.map((sec) =>
      formatTimeFromSeconds(sec + startTimeSeconds)
    );

    totalJourneySeconds = currentSeconds;

    setTimes({ arrival: formattedArrivals, departure: formattedDepartures });
    setFinalArrivalTime(formattedArrivals[formattedArrivals.length - 1]);
    setTotalJourneyTime(formatTimeFromSeconds(totalJourneySeconds));
  }, [state.gpxData, localStopTimes, state.startTime]);

  const handleStopTimeChange = debounce((stopTime: number, index: number) => {
    dispatch({ type: "UPDATE_STOP_TIME", payload: { index, stopTime } });
    const newStopTimes = [...localStopTimes];
    newStopTimes[index] = stopTime;
    setLocalStopTimes(newStopTimes);
  }, 300);

  return (
    <div className="outer-list-container">
      <div className="inner-list-container">
        <ul>
          {state.gpxData?.waypoints.map((waypoint, index) => (
            <WaypointItem
              key={`${waypoint.name}-${index}`}
              index={index}
              waypoint={waypoint}
              times={times}
              localStopTimes={localStopTimes}
              handleStopTimeChange={(stopTime) =>
                handleStopTimeChange(stopTime, index)
              }
              showStopTimeSelector={
                index > 0 && index < (state.gpxData?.waypoints?.length ?? 0) - 1
              }
              trackPart={state.gpxData?.trackParts?.[index]}
            />
          ))}
        </ul>
      </div>
      <div className="resulting-info">
        <div className="total-summation">
          <p>
            <strong>Distance:</strong> {totalDistance.toFixed(2)} km
          </p>
          <p>
            <strong>Road Time:</strong> {formatTimeFromSeconds(totalTravelTime)}
          </p>
          <p>
            <strong>Journey Time:</strong> {totalJourneyTime}
          </p>
        </div>
        <div className="arrival-time">
          <p>Arrival time</p>
          <div className="arrival-time-numbers">
            {formatTimeToHHMM(finalArrivalTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaypointList;
