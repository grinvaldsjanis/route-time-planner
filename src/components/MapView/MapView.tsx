import React from "react";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import "./MapView.css";
import { Waypoint, Track, Route } from "../../utils/parseGPX";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateBounds } from "../../utils/calculateBonds";
import { calculateElevationRange } from "../../utils/calculateElevationRange";
import getColorForElevation from "../../utils/getColorForElevation";

interface MapViewProps {
  waypoints: Waypoint[];
  routes: Route[];
  tracks: Track[];
}

const MapView: React.FC<MapViewProps> = ({ waypoints, tracks }) => {
  

  const { minElevation, maxElevation } = calculateElevationRange(tracks);

  const centralPoint: LatLngTuple = [0, 0]; // Define a central point for your map
  const defaultZoom: number = 10;
  const outerBounds = calculateBounds(waypoints);

  return (
    <MapContainer
      className="map-container"
      center={centralPoint}
      {...(outerBounds ? { bounds: outerBounds } : { zoom: defaultZoom })}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {waypoints.map((point, idx) => {
        const icon = createMarkerIcon(point.type || "default", idx + 1);
        return (
          <Marker
            key={idx}
            position={[parseFloat(point.lat), parseFloat(point.lon)]}
            icon={icon}
          >
            <Popup>{point.name || `Waypoint ${idx + 1}`}</Popup>
          </Marker>
        );
      })}
      {tracks.map((track, trackIdx) => {
        const trackPoints: LatLngExpression[] = [];
        track.segments.forEach((segment) => {
          segment.points.forEach((point) => {
            trackPoints.push([
              parseFloat(point.lat),
              parseFloat(point.lon),
            ] as LatLngTuple);
          });
        });

        // Outline (black line)
        const outline = (
          <Polyline
            key={`${trackIdx}-outline`}
            positions={trackPoints}
            color="rgba(0,0,0,0.4)"
            weight={9}
          />
        );

        // Colored line based on elevation
        const colored = trackPoints.map((pos, idx, arr) => {
          if (idx === 0) return null; // Skip the first point
          const startPos = arr[idx - 1];
          const endPos = pos;
          const elevation = parseFloat(
            track.segments[0].points[idx]?.ele || "0"
          );
          const color = getColorForElevation(
            elevation,
            minElevation,
            maxElevation
          );
          return (
            <Polyline
              key={`${trackIdx}-colored-${idx}`}
              positions={[startPos, endPos]}
              color={color}
              weight={3}
            />
          );
        });

        return [outline, ...colored.filter(Boolean)];
      })}
    </MapContainer>
  );
};

export default MapView;
