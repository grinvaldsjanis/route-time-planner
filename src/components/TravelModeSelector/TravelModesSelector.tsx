import React, { useState, useEffect, ChangeEvent } from 'react';
import travelModes from '../../constants/travelModes';
import { useGlobalState } from '../../context/GlobalContext';

type ModeKey = keyof typeof travelModes;

const TravelModeSelector: React.FC = () => {
  const { dispatch } = useGlobalState();
  const [selectedMode, setSelectedMode] = useState<ModeKey>(
    localStorage.getItem('travelMode') as ModeKey || 'Casual Walking'
  );

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as ModeKey;
    setSelectedMode(newMode);
    dispatch({ type: 'SET_TRAVEL_MODE', payload: newMode });
    localStorage.setItem('travelMode', newMode);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const storedMode = localStorage.getItem('travelMode') as ModeKey;
      if (storedMode && storedMode !== selectedMode) {
        setSelectedMode(storedMode);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedMode]);

  return (
    <div>
      <select value={selectedMode} onChange={handleSelectChange}>
        {Object.keys(travelModes).map((mode) => (
          <option key={mode} value={mode}>{mode}</option>
        ))}
      </select>
      <div>
        <strong>Description:</strong>
        <ul>
          <li>Max Speed: {travelModes[selectedMode].maxSpeed} km/h</li>
          <li>Handling Factor: {travelModes[selectedMode].handlingFactor}</li>
          <li>Power Factor: {travelModes[selectedMode].powerFactor}</li>
          <li>Terrain: {travelModes[selectedMode].terrain}</li>
        </ul>
      </div>
    </div>
  );
};

export default TravelModeSelector;
