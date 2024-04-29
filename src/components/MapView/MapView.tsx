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

  const [valueRanges, setValueRanges] = useState<ValueRanges>({
    ele: { minValue: 0, maxValue: 100 },
    curve: { minValue: 0, maxValue: 100 },
    slope: { minValue: 0, maxValue: 100 },
  });

  const modeMap: { [key: string]: ModeKeys } = {
    ele: "ele",
    curve: "curve",
    slope: "slope",
  };

  const handleMapMove = useCallback(
    (center: LatLngTuple, zoom: number) => {
      dispatch({ type: "SET_MAP_ZOOM", payload: zoom });
      dispatch({ type: "SET_MAP_CENTER", payload: center });
      // console.log("Map moved to:", center, "Zoom level:", zoom);
    },
    [dispatch]
  );

  const handleModeChange = (modeKey: string) => {
    const newMode = modeMap[modeKey];
    console.log("Current mode:", mapMode, "Attempting to switch to:", newMode);
    if (newMode && newMode !== mapMode) {
      dispatch({ type: "SET_MAP_MODE", payload: newMode });
      console.log("Mode after dispatch:", newMode);
    }
  };

  useEffect(() => {
    console.log("mapMode updated:", mapMode);
    setVersion((prev) => prev + 1); // Force re-render on mapMode change
  }, [mapMode]);

  const ModeToggles = () => (
    <div
      className="map-buttons" // This class is used for scoping button styles
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
      <button
        onClick={() => handleModeChange("ele")}
        className={mapMode === "ele" ? "button-active" : ""}
      >
        Elevation
      </button>
      <button
        onClick={() => handleModeChange("curve")}
        className={mapMode === "curve" ? "button-active" : ""}
      >
        Curvature
      </button>
      <button
        onClick={() => handleModeChange("slope")}
        className={mapMode === "slope" ? "button-active" : ""}
      >
        Slope
      </button>
    </div>
  );

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (gpxData?.tracks) {
      const newRanges = {
        ele: calculateValueRange(gpxData.tracks, "ele", 0),
        curve: calculateValueRange(gpxData.tracks, "curve", 1000),
        slope: calculateValueRange(gpxData.tracks, "slope", 0),
      };
      setValueRanges(newRanges);
      setVersion((v) => v + 1); // Ensure this is used to force update render keys
    }
  }, [gpxData, mapMode]);

  const renderTracks = useMemo(() => {
    if (!gpxData?.tracks) return null;

    return gpxData.tracks.map((track, trackIdx) => (
      <LayerGroup key={`${trackIdx}-${version}`}>
        {track.segments.flatMap((segment, segmentIdx) => {
          const outlinePositions = segment.points.map(
            (point) =>
              [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
          );

          return [
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

              const modeKey = modeMap[mapMode] || "ele"; // Safeguard to ensure valid mode
              const value = getValueForMode(point, prevPoint, modeKey);
              const color = getColorForValue(
                value,
                valueRanges[modeKey].minValue,
                valueRanges[modeKey].maxValue
              );

              return (
                <Polyline
                  key={`${trackIdx}-${segmentIdx}-${pointIdx}-${modeKey}`}
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
  }, [gpxData?.tracks, mapMode, valueRanges, version]);

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
        <ModeToggles />
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
