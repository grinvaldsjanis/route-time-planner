import "./WaypointModal.css";
import WaypointItem from "../../WaypointList/WaypointItem/WaypointItem";
import { useRef, useEffect } from "react";

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

  const handleClickOutside = (event: MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(event.target as Node)
    ) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        <WaypointItem index={waypointIndex} />
        {/* Optional close button */}
        {/* <button onClick={handleClose} className="modal-close-button">
          X
        </button> */}
      </div>
    </div>
  );
};

export default WaypointModal;
