// src/components/MapView/MapView.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayerGroup,
  Tooltip,
  Polyline,
} from "react-leaflet";
import type { LatLngTuple, Map } from "leaflet";
import "./MapView.css";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateValueRange } from "../../utils/calculateValueRange";
import { useGlobalState } from "../../context/GlobalContext";
import {
  setFocusedWaypoint,
  setIsProgrammaticMove,
  setMapCenter,
  setMapZoom,
} from "../../context/actions";
import WaypointModal from "./WaypointModal/WaypointModal";
import ModeToggles from "./ModeToggles/ModeToggles";
import MapEvents from "./MapEvents";
import { TrackPoint, TrackWaypoint } from "../../utils/types";
import ColorizedPolyline from "./ColorizedPolyline/ColorizedPolyline";

type ModeKeys = "ele" | "curve" | "slope";

const modeMap: { [key: string]: ModeKeys } = {
  ele: "ele",
  curve: "curve",
  slope: "slope",
};

const MapView: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const isProgrammaticMoveRef = useRef(false);
  const { state, dispatch } = useGlobalState();
  const {
    gpxData,
    mapCenter,
    mapZoom,
    mapMode,
    highlightMode, // Include highlightMode from state
    highlightRange, // Include highlightRange from state
    currentTrackIndex,
  } = state;

  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valueRanges, setValueRanges] = useState({
    ele: { minValue: 0, maxValue: 100 },
    curve: { minValue: 0, maxValue: 100 },
    slope: { minValue: 0, maxValue: 100 },
  });

  const handleMapMove = useCallback(
    (center: LatLngTuple, zoom: number) => {
      if (!isProgrammaticMoveRef.current) {
        dispatch(setMapZoom(zoom));
        dispatch(setMapCenter(center));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (gpxData?.tracks && gpxData.tracks.length > 0) {
      const newRanges = {
        ele: calculateValueRange(gpxData.tracks, "ele", 0),
        curve: calculateValueRange(gpxData.tracks, "curve", 1000),
        slope: calculateValueRange(gpxData.tracks, "slope", 0),
      };
      setValueRanges(newRanges);
    }
  }, [gpxData, mapMode]);

  useEffect(() => {
    if (mapRef.current && state.isProgrammaticMove) {
      mapRef.current.setView(mapCenter, mapZoom);
      isProgrammaticMoveRef.current = false;
      dispatch(setIsProgrammaticMove(false));
    }
  }, [mapCenter, mapZoom, dispatch, state.isProgrammaticMove]);

  const handleMarkerClick = (index: number) => {
    setSelectedWaypointIndex(index);
    dispatch(setFocusedWaypoint(index));
    setIsModalOpen(true);
  };

  const handleModeChange = (modeKey: string) => {
    const newMode = modeMap[modeKey];
    if (newMode && newMode !== mapMode) {
      dispatch({ type: "SET_MAP_MODE", payload: newMode });
    }
  };

  const currentTrack = currentTrackIndex !== null && gpxData?.tracks ? gpxData.tracks[currentTrackIndex] : null;

  const renderTracks = useMemo(() => {
    if (!gpxData || !gpxData.tracks || gpxData.tracks.length === 0) return null;

    return gpxData.tracks.map((track, trackIdx) => {
      const outlinePositions = track.points.map(
        (point: TrackPoint) =>
          [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
      );

      const isActive = trackIdx === currentTrackIndex;

      return (
        <LayerGroup key={`${trackIdx}`}>
          <Polyline
          key={"polyline"}
            positions={outlinePositions}
            color={isActive ? "#000000" : "#FF0000"}
            opacity={0.5}
            weight={isActive ? 10 : 2}
          />
          {isActive && (
            <ColorizedPolyline
            key={"colorized-polyline"}
            />
          )}
        </LayerGroup>
      );
    });
  }, [gpxData, currentTrackIndex, mapMode, highlightMode, highlightRange, valueRanges]);

  const renderMarkers = useMemo(() => {
    if (!gpxData || !currentTrack) return null;

    return currentTrack.waypoints.map((waypoint: TrackWaypoint, idx: number) => {
      const refWaypoint = gpxData.referenceWaypoints.find(ref => ref.id === waypoint.referenceId);
      if (!refWaypoint) return null;

      // Determine the icon type for the waypoint
      let iconType = refWaypoint.type || "via"; // Default to "via" if no type is set

      // Ensure the first waypoint gets the "start" icon and the last gets the "destination" icon
      if (idx === 0) {
        iconType = "start";
      } else if (idx === currentTrack.waypoints.length - 1) {
        iconType = "destination";
      } else if (iconType !== "start" && iconType !== "destination" && mapZoom < 11) {
        iconType = "small";
      }

      return (
        <Marker
          key={idx}
          position={[parseFloat(refWaypoint.lat), parseFloat(refWaypoint.lon)]}
          icon={createMarkerIcon(iconType, idx + 1)}
          eventHandlers={{ click: () => handleMarkerClick(idx) }}
        >
          <Tooltip sticky>{refWaypoint.name || `Waypoint ${idx + 1}`}</Tooltip>
        </Marker>
      );
    });
  }, [gpxData, currentTrack, mapZoom]);

  if (!gpxData || currentTrackIndex === null) {
    return <div>No GPX data available.</div>;
  }

  return (
    <div className="map-view">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
        <ModeToggles currentMode={mapMode} onModeChange={handleModeChange} />
        {renderTracks}
        {renderMarkers}
        <MapEvents onMapMove={handleMapMove} />
      </MapContainer>
      {selectedWaypointIndex !== null && gpxData && (
        <WaypointModal
          isOpen={isModalOpen}
          waypointIndex={selectedWaypointIndex}
          handleClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MapView;
