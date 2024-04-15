import formatTime from "../../../utils/formatTime";
import { TrackPart, Waypoint } from "../../../utils/parseGPX";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import TimeInfo from "../TimeInfo/TimeInfo";
import "./WaypointItem.css";

interface WaypointItemProps {
  waypoint: Waypoint;
  index: number;
  times: {
    arrival: string[];
    departure: string[];
  };
  handleStopTimeChange: (stopTime: number, index: number) => void;
  showStopTimeSelector: boolean;
  localStopTimes: number[];
  trackPart?: TrackPart;
}

const WaypointItem: React.FC<WaypointItemProps> = ({
  waypoint,
  index,
  times,
  handleStopTimeChange,
  showStopTimeSelector,
  localStopTimes,
  trackPart,
}) => {
  return (
    <li className="waypoint-list-item">
      <div className="item-content-container">
        <div className="item-top-row">
          <div className="item-order-number">{index + 1}</div>
          <div className="item-name">
            <strong>{waypoint.name || `Waypoint ${index + 1}`}</strong>
          </div>
        </div>
        <div className="waypoint-time-container">
          {showStopTimeSelector && (
            <StopTimeSelector
              index={index}
              localStopTimes={localStopTimes}
              handleStopTimeChange={handleStopTimeChange}
            />
          )}
          <TimeInfo
            index={index}
            times={times}
            waypoint={waypoint}
            localStopTimes={localStopTimes}
          />
        </div>
      </div>
      {trackPart && (
        <div
          className="track-part-container"
        >
          <p>Distance: {trackPart.distance.toFixed(2)} km</p>
          <p>Duration: {formatTime(trackPart.travelTime)}</p>
        </div>
      )}
    </li>
  );
};

export default WaypointItem;
