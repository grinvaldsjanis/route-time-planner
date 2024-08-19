import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  LayerGroup,
  Tooltip,
} from "react-leaflet";
import type { LatLngTuple, Map } from "leaflet";
import "./MapView.css";
import { createMarkerIcon } from "../../utils/markerStyles";
import { calculateValueRange } from "../../utils/calculateValueRange";
import getColorForValue from "../../utils/getColorForValue";
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

interface ValueRanges {
  ele: { minValue: number; maxValue: number };
  curve: { minValue: number; maxValue: number };
  slope: { minValue: number; maxValue: number };
}

const MapView: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const isProgrammaticMoveRef = useRef(false);
  const { state, dispatch } = useGlobalState();
  const {
    gpxData,
    mapCenter,
    mapZoom,
    mapMode,
    highlightMode,
    highlightRange,
    currentTrackIndex,
  } = state;
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      if (!isProgrammaticMoveRef.current) {
        dispatch(setMapZoom(zoom));
        dispatch(setMapCenter(center));
      }
    },
    [dispatch]
  );

  const handleModeChange = (modeKey: string) => {
    const newMode = modeMap[modeKey];
    if (newMode && newMode !== mapMode) {
      dispatch({ type: "SET_MAP_MODE", payload: newMode });
    }
  };

  const handleMarkerClick = (index: number) => {
    setSelectedWaypointIndex(index);
    dispatch(setFocusedWaypoint(index));
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedWaypointIndex(null);
  };

  useEffect(() => {
    setVersion((prev) => prev + 1);
  }, [mapMode]);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (gpxData?.tracks && gpxData.tracks.length > 0) {
      const newRanges = {
        ele: calculateValueRange(gpxData.tracks, "ele", 0),
        curve: calculateValueRange(gpxData.tracks, "curve", 1000),
        slope: calculateValueRange(gpxData.tracks, "slope", 0),
      };
      setValueRanges(newRanges);
      setVersion((v) => v + 1);
    }
  }, [gpxData, mapMode]);

  useEffect(() => {
    if (mapRef.current && state.isProgrammaticMove) {
      mapRef.current.setView(mapCenter, mapZoom);
      isProgrammaticMoveRef.current = false;
      dispatch(setIsProgrammaticMove(false));
    }
  }, [mapCenter, mapZoom, dispatch, state.isProgrammaticMove]);

  useEffect(() => {
    if (selectedWaypointIndex !== null && gpxData?.tracks[currentTrackIndex!]) {
      const track = gpxData.tracks[currentTrackIndex!];
      const waypoint = track.waypoints[selectedWaypointIndex];
      if (waypoint) {
        const refWaypoint = gpxData.referenceWaypoints.find(ref => ref.id === waypoint.referenceId);
        if (refWaypoint) {
          const newCenter: LatLngTuple = [
            parseFloat(refWaypoint.lat),
            parseFloat(refWaypoint.lon),
          ];
          isProgrammaticMoveRef.current = true;
          dispatch(setIsProgrammaticMove(true));
          dispatch(setMapCenter(newCenter));
          dispatch(setMapZoom(14));
        }
      }
    }
  }, [selectedWaypointIndex, gpxData, currentTrackIndex, dispatch]);

  // Move hooks outside conditional rendering
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
        <LayerGroup key={`${trackIdx}-${version}-${highlightMode}-${highlightRange}`}>
          {/* Drawing the current (active) track */}
          {isActive ? (
            <Polyline
              key={`${trackIdx}-outline`}
              positions={outlinePositions}
              color="#000000" // Black for the active track
              opacity={0.5}
              weight={10} // Thicker line for the active track
            />
          ) : (
            <Polyline
              key={`${trackIdx}-outline-inactive`}
              positions={outlinePositions}
              color="#FF0000" // Red for inactive tracks
              opacity={0.5}
              weight={2} // Thinner line for inactive tracks
            />
          )}

          {/* Colorized polyline for the active track only */}
          {isActive &&
            track.points.slice(1).map((point: TrackPoint, pointIdx: number) => {
              const prevPoint = track.points[pointIdx];
              const startPos: LatLngTuple = [
                parseFloat(prevPoint.lat),
                parseFloat(prevPoint.lon),
              ];
              const endPos: LatLngTuple = [
                parseFloat(point.lat),
                parseFloat(point.lon),
              ];

              const modeKey = modeMap[mapMode] || "ele";
              const value = getValueForMode(point, prevPoint, modeKey);
              let color;
              let opacity = 1;

              if (valueRanges[modeKey].minValue === valueRanges[modeKey].maxValue) {
                color = "blue";
              } else {
                color = getColorForValue(
                  value,
                  valueRanges[modeKey].minValue,
                  valueRanges[modeKey].maxValue,
                  mapMode === "curve"
                );
              }

              if (highlightMode && (value < highlightRange[0] || value > highlightRange[1])) {
                opacity = 0.05; // Reduce opacity for non-highlighted segments
              }

              return (
                <Polyline
                  key={`${trackIdx}-${pointIdx}-${modeKey}`}
                  positions={[startPos, endPos]}
                  color={color}
                  opacity={opacity}
                  weight={4}
                  className="polyline-transition"
                />
              );
            })}
        </LayerGroup>
      );
    });
  }, [
    gpxData,
    currentTrackIndex,
    highlightMode,
    highlightRange,
    mapMode,
    modeMap,
    valueRanges,
    version,
  ]);

  const renderMarkers = useMemo(() => {
    if (!gpxData || !gpxData.tracks || gpxData.tracks.length === 0 || !currentTrack) return null;
  
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
  }, [currentTrack, gpxData, mapZoom]);
  

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
          handleClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default MapView;
