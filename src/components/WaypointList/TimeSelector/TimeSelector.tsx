import React, { useState } from "react";
import { useGlobalState } from "../../../context/GlobalContext";
import { setStartTime } from "../../../context/actions";
import "./TimeSelector.css";

const TimeSelector: React.FC = () => {
  const { state, dispatch } = useGlobalState();

  const [hours, setHours] = useState(
    () => state.startTime?.split(":")[0] || "08"
  );
  const [minutes, setMinutes] = useState(
    () => state.startTime?.split(":")[1] || "00"
  );

  const validateAndFormat = (value: string, max: number): string => {
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > max) num = max;
    return num.toString().padStart(2, "0");
  };

  const updateStartTime = (currentHours: string, currentMinutes: string) => {
    if (currentHours.length === 2 && currentMinutes.length === 2) {
      dispatch(setStartTime(`${currentHours}:${currentMinutes}:00`));
    }
  };

  const handleHoursChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = validateAndFormat(event.target.value, 23);
    setHours(value);
    updateStartTime(value, minutes);
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = validateAndFormat(event.target.value, 59);
    setMinutes(value);
    updateStartTime(hours, value);
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
            maxLength={2}
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
            maxLength={2}
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
