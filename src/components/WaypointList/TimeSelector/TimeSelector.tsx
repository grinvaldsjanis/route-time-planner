import React, { useState, useEffect } from "react";
import { useGlobalState } from "../../../context/GlobalContext";
import { setStartTime } from "../../../context/actions";
import "./TimeSelector.css";

const TimeSelector: React.FC = () => {
  const { state, dispatch } = useGlobalState();

  const [hours, setHours] = useState(() => state.startTime?.split(':')[0].padStart(2, '0') || '08');
  const [minutes, setMinutes] = useState(() => state.startTime?.split(':')[1].padStart(2, '0') || '00');

  const validateTime = (value: string, max: number): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num <= max;
  };

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (validateTime(value, 23)) {
      setHours(value);
      if (minutes !== '') {
        // Append seconds here
        dispatch(setStartTime(`${value.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`));
      }
    }
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (validateTime(value, 59)) {
      setMinutes(value);
      if (hours !== '') {
        // Append seconds here
        dispatch(setStartTime(`${hours.padStart(2, '0')}:${value.padStart(2, '0')}:00`));
      }
    }
  };

  return (
    <div id="time_wrapper">
        <p>Departure time</p>
      <div id="time_input">
        <label htmlFor="hours">
          <input
            type="number"
            id="hours"
            value={hours}
            onChange={handleHoursChange}
            placeholder="HH"
            min="0"
            max="23"
          />
          <span className="label lbl-hrs">hours</span>
        </label>
        <span>:</span>
        <label htmlFor="minutes">
          <input
            type="number"
            id="minutes"
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="MM"
            min="0"
            max="59"
          />
          <span className="label lbl-min">minutes</span>
        </label>
      </div>
    </div>
  );
};

export default TimeSelector;
