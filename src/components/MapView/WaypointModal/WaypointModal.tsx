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
  const { state, dispatch } = useGlobalState();

  // Moved useEffect above the conditional returns
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

  // Now handle conditional rendering below the hooks
  if (!state.gpxData || state.currentTrackIndex === null) {
    return <div>No GPX data available.</div>;
  }

  if (!isOpen) return null;

  const currentTrack = state.gpxData.tracks[state.currentTrackIndex];

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        <WaypointItem index={waypointIndex} currentTrack={currentTrack}/>
        {/* Optional close button */}
        {/* <button onClick={handleClose} className="modal-close-button">
          X
        </button> */}
      </div>
    </div>
  );
};

export default WaypointModal;
