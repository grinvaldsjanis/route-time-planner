import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "./MapView.css";
import { Waypoint, Track, TrackPoint } from "../../utils/parseGPX";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateBounds } from "../../utils/calculateBonds";
import {
  calculateElevationRange,
  calculateCurvatureRange,
} from "../../utils/calculateRange";
import getColorForValue from "../../utils/getColorForValue";

const { Overlay } = LayersControl;

interface MapViewProps {
  waypoints: Waypoint[];
  tracks: Track[];
}

const MapView: React.FC<MapViewProps> = ({ waypoints, tracks }) => {
  const centralPoint: LatLngTuple = [0, 0];
  const defaultZoom: number = 10;
  const outerBounds = calculateBounds(waypoints);

  const getValueForMode = (
    point: TrackPoint,
    prevPoint: TrackPoint,
    mode: string
  ): number => {
    switch (mode) {
      case "elevation":
        return ((point.ele ?? 0) + (prevPoint.ele ?? 0)) / 2;
      case "curvature":
        return ((point.curve ?? 1000) + (prevPoint.curve ?? 1000)) / 2;
      default:
        return 0;
    }
  };

  const renderTracks = (mode: string) => {
    const { minElevation, maxElevation } = calculateElevationRange(tracks);
    const { minCurve, maxCurve } = calculateCurvatureRange(tracks);
    const minValue = mode === "elevation" ? minElevation : minCurve;
    const maxValue = mode === "elevation" ? maxElevation : maxCurve;

    return tracks.map((track, trackIdx) => (
      <LayerGroup key={trackIdx}>
        {track.segments.flatMap((segment, segmentIdx) => {
          // Create an array to hold both the outline and the colored polylines
          const polylines = [];

          // First, generate the outline for the entire segment
          const outlinePositions: LatLngTuple[] = segment.points.map(
            (point) =>
              [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
          );
          polylines.push(
            <Polyline
              key={`${trackIdx}-${segmentIdx}-outline`}
              positions={outlinePositions}
              color="rgba(0,0,0,0.6)"
              weight={9} // Outline is thicker
            />
          );

          // Then, generate the colored polylines for each part of the segment
          segment.points.slice(1).forEach((point, pointIdx) => {
            const prevPoint = segment.points[pointIdx];
            const startPos: LatLngTuple = [
              parseFloat(prevPoint.lat),
              parseFloat(prevPoint.lon),
            ];
            const endPos: LatLngTuple = [
              parseFloat(point.lat),
              parseFloat(point.lon),
            ];
            const value = getValueForMode(point, prevPoint, mode);
            const color = getColorForValue(value, minValue, maxValue);

            polylines.push(
              <Polyline
                key={`${trackIdx}-${segmentIdx}-${pointIdx}`}
                positions={[startPos, endPos]}
                color={color}
                weight={3} // Colored line is slightly thinner than the outline
              />
            );
          });

          return polylines;
        })}
      </LayerGroup>
    ));
  };

  return (
    <MapContainer
      center={centralPoint}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      className="map-container"
      {...(outerBounds ? { bounds: outerBounds } : { zoom: defaultZoom })}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayersControl position="topright">
        <Overlay name="Elevation">{renderTracks("elevation")}</Overlay>
        <Overlay name="Curvature">{renderTracks("curvature")}</Overlay>
        {/* Add more Overlay components for additional modes as needed */}
      </LayersControl>
      {waypoints.map((point, idx) => (
        <Marker
          key={idx}
          position={[parseFloat(point.lat), parseFloat(point.lon)]}
          icon={createMarkerIcon(point.type || "default", idx + 1)}
        >
          <Popup>{point.name || `Waypoint ${idx + 1}`}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
