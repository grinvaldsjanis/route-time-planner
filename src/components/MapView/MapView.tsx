import React from "react";
import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface Point {
  lat: string;
  lon: string;
  name?: string | null;
}

interface MapViewProps {
  waypoints: Point[];
  routes: Point[];
  tracks: Point[][];
}

const MapView: React.FC<MapViewProps> = ({ waypoints, routes, tracks }) => {
  const centralPoint = waypoints[0]
    ? [parseFloat(waypoints[0].lat), parseFloat(waypoints[0].lon)]
    : [0, 0];
  return (
    <div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {waypoints.map((point, idx) => (
          <Marker
            key={idx}
            position={[parseFloat(point.lat), parseFloat(point.lon)]}
          >
            <Popup>{point.name || `Waypoint ${idx + 1}`}</Popup>
          </Marker>
        ))}
        {routes.length > 0 && (
          <Polyline
            positions={routes.map((pt) => [
              parseFloat(pt.lat),
              parseFloat(pt.lon),
            ])}
            pathOptions={{ color: "red" }}
          />
        )}
        {tracks.map((track, idx) => (
          <Polyline
            key={idx}
            positions={track.map((pt) => [
              parseFloat(pt.lat),
              parseFloat(pt.lon),
            ])}
            pathOptions={{ color: "blue" }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
