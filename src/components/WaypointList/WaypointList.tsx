import React, { useEffect, useState } from "react";
import "./WaypointList.css";
import { useGlobalState } from "../../context/GlobalContext";
import formatTime from "../../utils/formatTime";
import { addTimes, convertMinutesToHHMMSS } from "../../utils/addTimes";
import WaypointItem from "./WaypointItem/WaypointItem";
import { debounce } from "lodash";

const WaypointList: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const [totalJourneyTime, setTotalJourneyTime] = useState<string>("");
  const [times, setTimes] = useState<{
    arrival: string[];
    departure: string[];
  }>({ arrival: [], departure: [] });
  const [localStopTimes, setLocalStopTimes] = useState<number[]>([]);

  useEffect(() => {
    if (state.gpxData?.waypoints) {
      state.gpxData.waypoints.forEach((waypoint, index) => {
        localStorage.removeItem(`waypointName_${index}`);
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
    if (!state.gpxData?.trackParts || !state.gpxData?.waypoints) {
      console.warn("No track parts or waypoints available");
      return;
    }

    const startJourneyTime = "08:00:00";
    let currentTime = startJourneyTime;
    const arrivalTimes: string[] = [];
    const departureTimes: string[] = [startJourneyTime];
    let totalMinutes = 0;

    state.gpxData.waypoints.forEach((waypoint, index) => {
      if (index > 0 && state.gpxData?.trackParts) {
        const travelMinutes =
          state.gpxData.trackParts[index - 1].travelTime / 60;
        currentTime = addTimes(
          currentTime,
          convertMinutesToHHMMSS(travelMinutes)
        );
        arrivalTimes[index] = currentTime;
        totalMinutes += travelMinutes;
      }

      const stopMinutes = localStopTimes[index];
      currentTime = addTimes(currentTime, convertMinutesToHHMMSS(stopMinutes));
      totalMinutes += stopMinutes;

      if (index < (state.gpxData?.waypoints?.length ?? 0) - 1) {
        departureTimes[index] = currentTime;
      }
    });

    setTimes({ arrival: arrivalTimes, departure: departureTimes });
    setTotalJourneyTime(convertMinutesToHHMMSS(totalMinutes));
  }, [state.gpxData, localStopTimes]);

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
