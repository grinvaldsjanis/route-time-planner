import { useMapEvents } from "react-leaflet";
import { setIsProgrammaticMove } from "../../context/actions";
import { useGlobalState } from "../../context/GlobalContext";
import { LatLngTuple } from "leaflet";

interface MapEventsProps {
  onMapMove: (center: LatLngTuple, zoom: number) => void;
}

function MapEvents({ onMapMove }: MapEventsProps) {
  const { state, dispatch } = useGlobalState();

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      const zoom = e.target.getZoom();
      onMapMove(center, zoom);
    },
    movestart: () => {
      if (state.isProgrammaticMove) {
        dispatch(setIsProgrammaticMove(false)); // Ensure it's false when manually dragging
      }
    },
  });

  return null;
}

export default MapEvents;
