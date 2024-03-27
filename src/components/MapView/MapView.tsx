import React, { useEffect, useState } from "react";
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
import { Waypoint, Track, TrackPoint } from "../../utils/parseGPX";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateBounds } from "../../utils/calculateBonds";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
import { useGlobalState } from "../../context/GlobalContext";

interface MapEventsProps {
  onMapMove: (center: LatLngTuple, zoom: number) => void;
}

function MapEvents({ onMapMove }: MapEventsProps) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      const zoom = e.target.getZoom();
      onMapMove([center.lat, center.lng], zoom);
    },
  });
  return null; // This component doesn't render anything itself
}

interface MapViewProps {
  waypoints: Waypoint[];
  tracks: Track[];
  gpxDataKey?: number;
}

const MapView: React.FC<MapViewProps> = ({ waypoints, tracks, gpxDataKey }) => {
  const { state, dispatch } = useGlobalState();
  const [activeLayer, setActiveLayer] = useState(state.mapMode);
  const outerBounds = calculateBounds(waypoints);
  const { mapCenter, mapZoom } = state;

  const handleMapMove = (center: LatLngTuple, zoom: number) => {
    // Dispatch actions to update global state
    dispatch({ type: "SET_MAP_CENTER", payload: center });
    dispatch({ type: "SET_MAP_ZOOM", payload: zoom });

    // Save to localStorage (optional, if you want to persist these values)
    localStorage.setItem("mapCenter", JSON.stringify(center));
    localStorage.setItem("mapZoom", JSON.stringify(zoom));
  };

  useEffect(() => {
    dispatch({ type: "SET_MAP_MODE", payload: activeLayer });
  }, [activeLayer, dispatch]);

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
  };

  const LayerToggles = () => (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
      <button onClick={() => handleLayerChange("elevation")}>Elevation</button>
      <button onClick={() => handleLayerChange("curvature")}>Curvature</button>
      <button onClick={() => handleLayerChange("slope")}>Slope</button>
    </div>
  );

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
      case "slope":
        return point.slope ?? 0;
      default:
        return 0;
    }
  };

  const renderTracks = (mode: string) => {
    const { minValue: minElevation, maxValue: maxElevation } =
      calculateValueRange(tracks, "elevation", 0);
    const { minValue: minCurve, maxValue: maxCurve } = calculateValueRange(
      tracks,
      "curvature",
      1000
    );
    const { minValue: minSlope, maxValue: maxSlope } = calculateValueRange(
      tracks,
      "slope",
      0
    );

    let minValue: number;
    let maxValue: number;

    switch (mode) {
      case "elevation":
        minValue = minElevation;
        maxValue = maxElevation;
        break;
      case "curvature":
        minValue = minCurve;
        maxValue = maxCurve;
        break;
      case "slope":
        minValue = minSlope;
        maxValue = maxSlope;
        break;
      default:
        console.error("Unrecognized mode:", mode);
        minValue = 0;
        maxValue = 0;
    }

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
              weight={9}
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
      key={gpxDataKey || "defaultKey"}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="map-container"
      // {...(outerBounds ? { bounds: outerBounds } : { zoom: defaultZoom })}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayerToggles />
      {activeLayer === "elevation" && <>{renderTracks("elevation")}</>}
      {activeLayer === "curvature" && <>{renderTracks("curvature")}</>}
      {activeLayer === "slope" && <>{renderTracks("slope")}</>}
      {waypoints.map((point, idx) => (
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
  );
};

export default MapView;
