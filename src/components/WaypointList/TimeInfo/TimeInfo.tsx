import React from "react";
import { Waypoint } from "../../../utils/parseGPX";
import "./TimeInfo.css";
import formatTimeToHHMM from "../../../utils/formatTimeToHHMM";

interface TimeInfoProps {
  index: number;
  times: {
    arrival: string[];
    departure: string[];
  };
  waypoint: Waypoint;
  localStopTimes: number[];
}

const TimeInfo: React.FC<TimeInfoProps> = ({
  index,
  times,
  localStopTimes,
}) => {
  return (
    <>
      {index === 0 && <p>Departure: {formatTimeToHHMM(times.departure[index])}</p>}
      {index === localStopTimes.length - 1 && (
        <p>Arrival: {formatTimeToHHMM(times.arrival[index])}</p>
      )}
      {localStopTimes[index] > 0 && (
        <div className="arrival-departure">
          <p>Arrival: {formatTimeToHHMM(times.arrival[index])}</p>
          <p>Departure: {formatTimeToHHMM(times.departure[index])}</p>
        </div>
      )}
      {index > 0 &&
        index < localStopTimes.length - 1 &&
        localStopTimes[index] === 0 && (
          <p>Pass: {formatTimeToHHMM(times.arrival[index])}</p>
        )}
    </>
  );
};

export default TimeInfo;
