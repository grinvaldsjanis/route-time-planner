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
import { TrackPoint } from "../../utils/types";

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
  const { gpxData, mapCenter, mapZoom, mapMode } = state;
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
    if (gpxData?.tracks) {
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
    if (selectedWaypointIndex !== null && gpxData?.waypoints) {
      const waypoint = gpxData.waypoints[selectedWaypointIndex];
      if (waypoint) {
        const newCenter: LatLngTuple = [
          parseFloat(waypoint.lat),
          parseFloat(waypoint.lon),
        ];
        isProgrammaticMoveRef.current = true;
        dispatch(setIsProgrammaticMove(true));
        dispatch(setMapCenter(newCenter));
        dispatch(setMapZoom(15));
      }
    }
  }, [selectedWaypointIndex, gpxData, dispatch]);

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

              const modeKey = modeMap[mapMode] || "ele";
              const value = getValueForMode(point, prevPoint, modeKey);
              let color;
              if (valueRanges[modeKey].minValue === valueRanges[modeKey].maxValue) {
                color = "red";
              } else {
                color = getColorForValue(
                  value,
                  valueRanges[modeKey].minValue,
                  valueRanges[modeKey].maxValue,
                  mapMode === "curve"
                );
              }

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
  }, [gpxData?.tracks, mapMode, modeMap, valueRanges, version]);

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
        {mapZoom >= 11 &&
          gpxData?.waypoints.map((point, idx) => (
            <Marker
              key={idx}
              position={[parseFloat(point.lat), parseFloat(point.lon)]}
              icon={createMarkerIcon(point.type || "default", idx + 1)}
              eventHandlers={{ click: () => handleMarkerClick(idx) }}
            >
              <Tooltip sticky>{point.name || `Waypoint ${idx + 1}`}</Tooltip>
            </Marker>
          ))}
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
