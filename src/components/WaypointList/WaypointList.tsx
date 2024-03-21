// Assuming this is in WaypointList.tsx within your components/WaypointList directory

import React from "react";
import "./WaypointList.css"; // Make sure to create and style your component accordingly

interface Waypoint {
  lat: string;
  lon: string;
  name: string | null;
  desc: string | null;
}

interface WaypointListProps {
  waypoints: Waypoint[];
}

const WaypointList: React.FC<WaypointListProps> = ({ waypoints }) => {
  return (
    <div className="waypoint-list">
      <h2>Waypoints</h2>
      <ul>
        {waypoints.map((waypoint, index) => (
          <li key={index}>
            <strong>{waypoint.name ? waypoint.name : `Waypoint ${index + 1}`}</strong>
            <p>Coordinates: {waypoint.lat}, {waypoint.lon}</p>
            {waypoint.desc && <p>Description: {waypoint.desc}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaypointList;
