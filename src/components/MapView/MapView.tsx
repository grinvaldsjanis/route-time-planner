import React from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "./MapView.css";
import { Waypoint, Track } from "../../utils/parseGPX";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateElevationRange, calculateCurvatureRange } from "../../utils/calculateRange";
import getColorForValue from "../../utils/getColorForValue";
import { calculateBounds } from "../../utils/calculateBonds";

const { Overlay } = LayersControl;

interface MapViewProps {
  waypoints: Waypoint[];
  routes: any[]; // Assuming you have a Route type
  tracks: Track[];
}

const MapView: React.FC<MapViewProps> = ({ waypoints, tracks }) => {
  const { minElevation, maxElevation } = calculateElevationRange(tracks);
  const { minCurve, maxCurve } = calculateCurvatureRange(tracks);
  const centralPoint: LatLngTuple = [0, 0]; // Define a central point for your map
  const defaultZoom: number = 10;
  const outerBounds = calculateBounds(waypoints);

  const renderTracks = (valueSelector, minValue, maxValue) => {
    return tracks.map((track, trackIdx) =>
      <LayerGroup key={trackIdx}>
        {track.segments.flatMap((segment, segmentIdx) =>
          segment.points.map((point, pointIdx, arr) => {
            if (pointIdx === 0) return null; // Skip the first point
            const startPos:LatLngTuple = [parseFloat(arr[pointIdx - 1].lat), parseFloat(arr[pointIdx - 1].lon)];
            const endPos:LatLngTuple = [parseFloat(point.lat), parseFloat(point.lon)];
            const value = valueSelector(point);
            const color = getColorForValue(value, minValue, maxValue);
            return (
              <Polyline
                key={`${trackIdx}-${segmentIdx}-${pointIdx}`}
                positions={[startPos, endPos]}
                color={color}
                weight={3}
              />
            );
          })
        )}
      </LayerGroup>
    );
  };

  return (
    <MapContainer center={centralPoint} zoom={defaultZoom} scrollWheelZoom={true} className="map-container" bounds={outerBounds}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayersControl position="topright">
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </BaseLayer>
        <Overlay name="Elevation">
          {renderTracks(point => point.ele ?? 0, minElevation, maxElevation)}
        </Overlay>
        <Overlay name="Curvature">
          {renderTracks(point => point.curve ?? 10000, minCurve, maxCurve)}
        </Overlay>
      </LayersControl>
      {waypoints.map((point, idx) => (
        <Marker key={idx} position={[parseFloat(point.lat), parseFloat(point.lon)]} icon={createMarkerIcon(point.type || "default", idx + 1)}>
          <Popup>{point.name || `Waypoint ${idx + 1}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;