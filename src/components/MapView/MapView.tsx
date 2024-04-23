import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  LayerGroup,
  useMapEvents,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "./MapView.css";
import { TrackPoint } from "../../utils/parseGPX";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
import { useGlobalState } from "../../context/GlobalContext";

type ModeKeys = "ele" | "curve" | "slope";

const getValueForMode = (
  point: TrackPoint,
  prevPoint: TrackPoint,
  mode: ModeKeys
): number => {
  const pointValue = point[mode] ?? 0;
  const prevPointValue = prevPoint[mode] ?? 0;
  return (pointValue + prevPointValue) / 2;
};

interface MapEventsProps {
  onMapMove: (center: LatLngTuple, zoom: number) => void;
}

function MapEvents({ onMapMove }: MapEventsProps) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      const zoom = e.target.getZoom();
      onMapMove(center, zoom);
    },
  });
  return null;
}

interface ValueRanges {
  ele: { minValue: number; maxValue: number };
  curve: { minValue: number; maxValue: number };
  slope: { minValue: number; maxValue: number };
}

const MapView: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const { gpxData, mapCenter, mapZoom, mapMode, dataVersion } = state;

  // Use a mapping object to convert human-readable layer names to key names
  const layerMap: { [key: string]: keyof ValueRanges } = {
    elevation: "ele",
    curvature: "curve",
    slope: "slope",
  };

  // Initialize activeLayer using the mapping to ensure it's always valid
  const [activeLayer, setActiveLayer] = useState<keyof ValueRanges>(
    layerMap[mapMode] || "ele"
  );

  useEffect(() => {
    setActiveLayer(layerMap[mapMode] || "ele");
  }, [mapMode]);

  const handleMapMove = useCallback(
    (center: LatLngTuple, zoom: number) => {
      dispatch({ type: "SET_MAP_ZOOM", payload: zoom });
      dispatch({ type: "SET_MAP_CENTER", payload: center });
      console.log("Map moved to:", center, "Zoom level:", zoom);
    },
    [dispatch]
  );

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layerMap[layer] || "ele");
  };

  const LayerToggles = () => (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignContent: "normal",
        justifyContent: "start",
      }}
    >
      <button onClick={() => handleLayerChange("elevation")}>Elevation</button>
      <button onClick={() => handleLayerChange("curvature")}>Curvature</button>
      <button onClick={() => handleLayerChange("slope")}>Slope</button>
    </div>
  );

  const renderTracks = useMemo(() => {
    if (!gpxData?.tracks) return null;

    const tracks = gpxData.tracks;
    const valueRanges = {
      ele: calculateValueRange(tracks, "ele", 0),
      curve: calculateValueRange(tracks, "curve", 1000),
      slope: calculateValueRange(tracks, "slope", 0),
    };

    return tracks.map((track, trackIdx) => (
      <LayerGroup key={trackIdx}>
        {track.segments.flatMap((segment, segmentIdx) => {
          const outlinePositions = segment.points.map(
            (point) =>
              [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
          );

          return [
            // Render the outline polyline for the entire track segment
            <Polyline
              key={`${trackIdx}-${segmentIdx}-outline`}
              positions={outlinePositions}
              color="#000000"
              opacity={0.5}
              weight={10}
            />,
            ...segment.points.slice(1).map((point, pointIdx) => {
              const prevPoint = segment.points[pointIdx];
              const startPos: LatLngTuple = [
                parseFloat(prevPoint.lat),
                parseFloat(prevPoint.lon),
              ];
              const endPos: LatLngTuple = [
                parseFloat(point.lat),
                parseFloat(point.lon),
              ];

              const value = getValueForMode(
                point,
                prevPoint,
                activeLayer as ModeKeys
              );
              const color = getColorForValue(
                value,
                valueRanges[activeLayer].minValue,
                valueRanges[activeLayer].maxValue
              );

              // Render the colored polyline for the segment
              return (
                <Polyline
                  key={`${trackIdx}-${segmentIdx}-${pointIdx}-${activeLayer}`}
                  positions={[startPos, endPos]}
                  color={color}
                  weight={4}
                />
              );
            }),
          ];
        })}
      </LayerGroup>
    ));
  }, [gpxData?.tracks, activeLayer]);

  return (
    <div className="map">
      <MapContainer
        key={`map-${dataVersion}`}
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
        <LayerToggles />
        {renderTracks}
        {mapZoom >= 11 &&
          gpxData?.waypoints.map((point, idx) => (
            <Marker
              key={idx}
              position={[parseFloat(point.lat), parseFloat(point.lon)]}
              icon={createMarkerIcon(point.type || "default", idx + 1)}
            >
              <Popup>{point.name || `Waypoint ${idx + 1}`}</Popup>
            </Marker>
          ))}
        <MapEvents onMapMove={handleMapMove} />
      </MapContainer>
    </div>
  );
};

export default MapView;
