import L, { LatLngTuple } from "leaflet";

const calculateCenterFromBounds = (
  bounds: [LatLngTuple, LatLngTuple]
): LatLngTuple => {
  const latLngBounds = L.latLngBounds(bounds);
  const center = latLngBounds.getCenter();
  return [center.lat, center.lng];
};

export default calculateCenterFromBounds;