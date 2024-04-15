import React from 'react';
import { Waypoint } from '../../../utils/parseGPX';
import "./TimeInfo.css";

interface TimeInfoProps {
    index: number;
    times: {
        arrival: string[];
        departure: string[];
    };
    waypoint: Waypoint;
    localStopTimes: number[];
}

const TimeInfo: React.FC<TimeInfoProps> = ({ index, times, localStopTimes }) => {
    return (
        <div className='time-info-wrapper'>
            {index === 0 && <p>Departure: {times.departure[index]}</p>}
            {index === localStopTimes.length - 1 && <p>Arrival: {times.arrival[index]}</p>}
            {localStopTimes[index] > 0 && (
                <div className='arrival-departure'>
                    <p>Arrival: {times.arrival[index]}</p>
                    <p>Departure: {times.departure[index]}</p>
                </div>
            )}
            {index > 0 && index < localStopTimes.length - 1 && localStopTimes[index] === 0 && (
                <p>Pass: {times.arrival[index]}</p>
            )}
        </div>
    );
};

export default TimeInfo;
