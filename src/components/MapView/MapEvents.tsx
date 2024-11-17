import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapEvents = ({ onMapMove }: { onMapMove: () => void }) => {
  const map = useMap();

  useEffect(() => {
    const handleMove = () => onMapMove();
    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);

    return () => {
      map.off("moveend", handleMove);
      map.off("zoomend", handleMove);
    };
  }, [map, onMapMove]);

  return null;
};

export default MapEvents;
