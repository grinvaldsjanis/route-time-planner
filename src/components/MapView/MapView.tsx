import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayerGroup,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import type { LatLngTuple, Map } from "leaflet";
import "./MapView.css";
import { createMarkerIcon } from "../../utils/markerStyles";
import { useGlobalState } from "../../context/GlobalContext";
import { setMapCenter, setMapZoom } from "../../context/actions"; // Removed unused imports
import WaypointModal from "./WaypointModal/WaypointModal";
import ModeToggles from "./ModeToggles/ModeToggles";
import MapEvents from "./MapEvents";
import { TrackPoint, TrackWaypoint } from "../../utils/types";
import ColorizedPolyline from "./ColorizedPolyline/ColorizedPolyline";
import L from "leaflet";
import { debounce } from "lodash";

type ModeKeys = "ele" | "curve" | "slope" | "speedLimit";

const modeMap: { [key: string]: ModeKeys } = {
  ele: "ele",
  curve: "curve",
  slope: "slope",
  speedLimit: "speedLimit",
};

const MapView: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const { state, dispatch } = useGlobalState();
  const {
    gpxData,
    mapZoom,
    mapMode,
    currentTrackIndex,
    mapBounds,
    programmaticAction,
    focusedWaypointIndex,
  } = state;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      dispatch(setMapCenter([center.lat, center.lng]));
      dispatch(setMapZoom(zoom));
    }
  }, [dispatch]);

  // const handleFitActiveTrack = useCallback(() => {
  //   if (!mapRef.current || !currentTrackIndex || !gpxData) {
  //     console.warn("Cannot fit active track: map or data is not ready.");
  //     return;
  //   }

  //   const activeTrack = gpxData.tracks[currentTrackIndex];
  //   if (!activeTrack || !activeTrack.points.length) {
  //     console.warn("Active track has no points to calculate bounds.");
  //     return;
  //   }

  //   const bounds = L.latLngBounds(
  //     activeTrack.points.map((point) => [
  //       parseFloat(point.lat),
  //       parseFloat(point.lon),
  //     ])
  //   );

  //   if (bounds.isValid()) {
  //     mapRef.current.fitBounds(bounds, { animate: true, padding: [50, 50] });
  //   }
  // }, [currentTrackIndex, gpxData]);

  const debouncedFitBounds = useMemo(
    () =>
      debounce(() => {
        if (!mapRef.current || !mapBounds) {
          console.warn("Cannot fit bounds: Map or bounds are not ready.");
          return;
        }

        const bounds = L.latLngBounds(mapBounds);
        if (bounds.isValid()) {
          console.log("Debounced fitting bounds:", bounds);
          mapRef.current.fitBounds(bounds, {
            animate: true,
            padding: [50, 50],
          });
        }
      }, 300),
    [mapBounds]
  );

  useEffect(() => {
    if (programmaticAction === "fitBounds") {
      debouncedFitBounds();
    }
  }, [programmaticAction, mapBounds]);

  const centerOnWaypoint = useCallback(() => {
    if (
      !mapRef.current ||
      focusedWaypointIndex === null ||
      currentTrackIndex === null ||
      !gpxData
    )
      return;

    const selectedWaypoint =
      gpxData.tracks[currentTrackIndex].waypoints[focusedWaypointIndex];
    const refWaypoint = gpxData.referenceWaypoints.find(
      (ref) => ref.id === selectedWaypoint.referenceId
    );

    if (refWaypoint) {
      const waypointPosition: LatLngTuple = [
        parseFloat(refWaypoint.lat),
        parseFloat(refWaypoint.lon),
      ];
      mapRef.current.setView(waypointPosition, 15, { animate: true });
      dispatch({ type: "SET_PROGRAMMATIC_ACTION", payload: null }); // Clear action
    }
  }, [focusedWaypointIndex, currentTrackIndex, gpxData, dispatch]);

  useEffect(() => {
    console.log("Global State Updated:", state);
  }, [state]);
  //
  useEffect(() => {
    console.log("Bounds updated:", mapBounds);
    console.log("Programmatic action:", programmaticAction);
  }, [mapBounds, programmaticAction]);

  useEffect(() => {
    if (programmaticAction === "fitBounds" && mapBounds && mapRef.current) {
      console.log("Triggering fitBounds...");
      debouncedFitBounds();
    } else if (
      programmaticAction === "focusWaypoint" &&
      focusedWaypointIndex !== null
    ) {
      console.log("Triggering centerOnWaypoint...");
      centerOnWaypoint();
    } else if (programmaticAction) {
      console.warn("Unhandled programmatic action:", programmaticAction);
    }

    // Clear programmaticAction only after handling
    if (programmaticAction) {
      dispatch({ type: "SET_PROGRAMMATIC_ACTION", payload: null });
    }
  }, [
    programmaticAction,
    mapBounds,
    debouncedFitBounds,
    centerOnWaypoint,
    dispatch,
    focusedWaypointIndex,
  ]);

  const handleMarkerClick = (index: number) => {
    dispatch({ type: "SET_FOCUSED_WAYPOINT", payload: index });
    dispatch({ type: "SET_PROGRAMMATIC_ACTION", payload: "focusWaypoint" }); // Trigger waypoint focus
  };

  const handleModeChange = (modeKey: string) => {
    const newMode = modeMap[modeKey];
    if (newMode && newMode !== mapMode) {
      dispatch({ type: "SET_MAP_MODE", payload: newMode });
    }
  };

  const currentTrack = useMemo(() => {
    return currentTrackIndex !== null && gpxData?.tracks
      ? gpxData.tracks[currentTrackIndex]
      : null;
  }, [currentTrackIndex, gpxData]);

  const renderTracks = useMemo(() => {
    if (!gpxData || !gpxData.tracks || gpxData.tracks.length === 0) return null;

    return gpxData.tracks.map((track, trackIdx) => {
      const outlinePositions = track.points.map(
        (point: TrackPoint) =>
          [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
      );

      const isActive = trackIdx === currentTrackIndex;

      return (
        <LayerGroup key={`track-layer-${trackIdx}`}>
          {isActive ? (
            <ColorizedPolyline />
          ) : (
            <Polyline
              positions={outlinePositions}
              color="#FF0000"
              opacity={0.5}
              weight={2}
            />
          )}
        </LayerGroup>
      );
    });
  }, [gpxData, currentTrackIndex]);

  //  sfsffs
  const MapRefSetter = () => {
    const map = useMap();

    useEffect(() => {
      if (!mapRef.current) {
        console.log("Initializing map reference...");
        mapRef.current = map;
      }
    }, [map]);

    return null;
  };

  const renderMarkers = useMemo(() => {
    if (!gpxData || !currentTrack) return null;

    return currentTrack.waypoints.map(
      (waypoint: TrackWaypoint, idx: number) => {
        const refWaypoint = gpxData.referenceWaypoints.find(
          (ref) => ref.id === waypoint.referenceId
        );
        if (!refWaypoint) return null;

        let iconType = refWaypoint.type || "via";

        if (idx === 0) {
          iconType = "start";
        } else if (idx === currentTrack.waypoints.length - 1) {
          iconType = "destination";
        } else if (
          iconType !== "start" &&
          iconType !== "destination" &&
          mapZoom < 11
        ) {
          iconType = "small";
        }

        return (
          <Marker
            key={idx}
            position={[
              parseFloat(refWaypoint.lat),
              parseFloat(refWaypoint.lon),
            ]}
            icon={createMarkerIcon(iconType, idx + 1)}
            eventHandlers={{ click: () => handleMarkerClick(idx) }}
          >
            <Tooltip key={`tooltip-${idx}`} sticky className="waypoint-tooltip">
              {refWaypoint.name || `Waypoint ${idx + 1}`}
            </Tooltip>
          </Marker>
        );
      }
    );
  }, [gpxData, currentTrack, mapZoom, handleMarkerClick]);

  if (!gpxData || currentTrackIndex === null) {
    return <div>No GPX data available.</div>;
  }

  return (
    <div className="map-view">
      <MapContainer
        center={state.mapCenter}
        zoom={state.mapZoom}
        scrollWheelZoom={true}
        className="map-container"
      >
        <MapRefSetter />
        <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
        <ModeToggles currentMode={mapMode} onModeChange={handleModeChange} />
        {renderTracks}
        {renderMarkers}
        <MapEvents onMapMove={handleMapMove} />
      </MapContainer>

      {/* <div className="controls">
        <button onClick={handleFitActiveTrack}>Fit Active Track</button>
      </div> */}

      {isModalOpen && focusedWaypointIndex !== null && (
        <WaypointModal
          isOpen={true}
          waypointIndex={focusedWaypointIndex}
          handleClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MapView;
