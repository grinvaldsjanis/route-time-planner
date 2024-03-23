import React from "react";
import "./WaypointList.css";
import { Waypoint } from "../../utils/parseGPX";

interface WaypointListProps {
  waypoints: Waypoint[];
}

const WaypointList: React.FC<WaypointListProps> = ({ waypoints }) => {
  return (
    <div className="waypoint-list">
      <ul>
        {waypoints.map((waypoint, index) => (
          <li key={index}>
            <div className="item-content-container">
              <div className="item-top-row">
                <div className="item-order-number">
                  <p>{index + 1}</p>
                </div>
                <div className="item-name">
                  <strong>
                    {waypoint.name ? waypoint.name : `Waypoint ${index + 1}`}
                  </strong>
                </div>
              </div>
              <div>{waypoint.desc && <p>{waypoint.desc}</p>}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaypointList;
