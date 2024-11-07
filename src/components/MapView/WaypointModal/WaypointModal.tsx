import "./WaypointModal.css";
import WaypointItem from "../../WaypointList/WaypointItem/WaypointItem";
import { useRef, useEffect } from "react";
import { useGlobalState } from "../../../context/GlobalContext";

interface WaypointModalProps {
  isOpen: boolean;
  waypointIndex: number;
  handleClose: () => void;
}

const WaypointModal: React.FC<WaypointModalProps> = ({
  isOpen,
  waypointIndex,
  handleClose,
}) => {
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const { state } = useGlobalState();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClose]);

  if (!state.gpxData || state.currentTrackIndex === null) {
    return <div>No GPX data available.</div>;
  }

  if (!isOpen) return null;

  const currentTrack = state.gpxData.tracks[state.currentTrackIndex];

  // Retrieve the specific trackWaypoint and referenceWaypoint using the waypointIndex
  const trackWaypoint = currentTrack.waypoints[waypointIndex];
  const referenceWaypoint = state.gpxData.referenceWaypoints.find(
    (refWaypoint) => refWaypoint.id === trackWaypoint.referenceId
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        {trackWaypoint && referenceWaypoint && (
          <WaypointItem index={waypointIndex} />
        )}
      </div>
    </div>
  );
};

export default WaypointModal;
