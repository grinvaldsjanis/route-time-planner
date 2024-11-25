import { useState, useEffect, useMemo } from "react";
import { Polyline, LayerGroup, Marker, Tooltip, useMap } from "react-leaflet";
import { DivIcon, LatLngTuple } from "leaflet";
import getColorForValue from "../../../utils/getColorForValue";
import "./ColorizedPolyline.css";
import { useGlobalState } from "../../../context/GlobalContext";
import { calculateBearing } from "../../../utils/calculateBearing";
import { setHoveredDistance } from "../../../context/actions";

const createDistanceMarkerIcon = () => {
  return new DivIcon({
    className: "distance-marker-icon",
    html: `<div class="distance-marker-circle"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createDirectionalMarkerIcon = (angle: number) => {
  const arrowIcon = `
    <div style="transform: rotate(${angle}deg);">
      ▲
    </div>
  `;
  return new DivIcon({
    className: "directional-marker-icon",
    html: arrowIcon,
    iconSize: [14, 14],
    iconAnchor: [7, 11],
  });
};

const getMarkerSpacingByZoom = (zoom: number): number => {
  const baseDistance = 300;
  const zoomLevelDiff = zoom - 5;
  return baseDistance / Math.pow(2, zoomLevelDiff);
};

const ColorizedPolyline: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const [hoverMarkerPos, setHoverMarkerPos] = useState<LatLngTuple | null>(
    null
  );
  const [isHoveringOverPolyline, setIsHoveringOverPolyline] = useState(false); // New state

  const {
    gpxData,
    mapMode,
    currentTrackIndex,
    highlightMode,
    highlightRange,
    valueRanges,
    hoveredDistance,
  } = state;

  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on("zoomend", handleZoom);

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map]);

  useEffect(() => {
    if (!gpxData || currentTrackIndex === null || hoveredDistance === null) {
      setHoverMarkerPos(null);
      return;
    }

    const currentTrack = gpxData.tracks[currentTrackIndex];
    if (!currentTrack) return;

    const closestPoint = currentTrack.points.find(
      (point) => (point.distanceFromStart ?? Infinity) >= hoveredDistance
    );

    if (closestPoint) {
      setHoverMarkerPos([
        parseFloat(closestPoint.lat),
        parseFloat(closestPoint.lon),
      ]);
    } else {
      setHoverMarkerPos(null);
    }
  }, [hoveredDistance, gpxData, currentTrackIndex]);

  const currentTrack = useMemo(() => {
    if (currentTrackIndex !== null && gpxData?.tracks) {
      return gpxData.tracks[currentTrackIndex];
    }
    return null;
  }, [gpxData, currentTrackIndex]);

  const { fullTrackPositions, coloredSegmentsWithMarkers } = useMemo(() => {
    if (!currentTrack || currentTrack.points.length < 2) {
      return { fullTrackPositions: [], coloredSegmentsWithMarkers: null };
    }

    const fullTrackPositions = currentTrack.points.map(
      (point) => [parseFloat(point.lat), parseFloat(point.lon)] as LatLngTuple
    );

    const { minValue, maxValue } = valueRanges[mapMode];
    const markerSpacingKm = getMarkerSpacingByZoom(zoomLevel);
    let distanceSinceLastMarker = 0;

    const segmentsWithMarkers: JSX.Element[] = [];

    currentTrack.points.slice(1).forEach((point, pointIdx) => {
      const prevPoint = currentTrack.points[pointIdx];
      if (!prevPoint || !point) return;

      const startPos: LatLngTuple = [
        parseFloat(prevPoint.lat),
        parseFloat(prevPoint.lon),
      ];
      const endPos: LatLngTuple = [
        parseFloat(point.lat),
        parseFloat(point.lon),
      ];

      const value = ((prevPoint[mapMode] ?? 0) + (point[mapMode] ?? 0)) / 2;
      const color =
        minValue === maxValue
          ? "blue"
          : getColorForValue(value, minValue, maxValue, mapMode === "curve");
      const opacity =
        highlightMode &&
        (value < highlightRange[0] || value > highlightRange[1])
          ? 0.05
          : 1;

      const segmentDistanceKm =
        point.distanceFromStart! - prevPoint.distanceFromStart!;
      distanceSinceLastMarker += segmentDistanceKm / 1000;

      segmentsWithMarkers.push(
        <Polyline
          key={`colored-segment-${pointIdx}-${mapMode}`}
          positions={[startPos, endPos]}
          color={color}
          weight={6}
          pathOptions={{ opacity }}
          eventHandlers={{
            mouseover: () => {
              setIsHoveringOverPolyline(true); // Set flag to true
              dispatch(setHoveredDistance(point.distanceFromStart!));
            },
            mouseout: () => {
              setIsHoveringOverPolyline(false); // Set flag to false
              dispatch(setHoveredDistance(null));
            },
          }}
        >
          <Tooltip
            key={`tooltip-${pointIdx}`}
            direction="top"
            sticky
            opacity={1}
            className="tooltip-transition"
          >
            <div>{value.toFixed(2)}</div>
          </Tooltip>
        </Polyline>
      );

      if (distanceSinceLastMarker >= markerSpacingKm) {
        const bearing = calculateBearing(startPos, endPos);
        segmentsWithMarkers.push(
          <Marker
            key={`marker-${pointIdx}-${mapMode}`}
            position={endPos}
            icon={createDirectionalMarkerIcon(bearing)}
          />
        );
        distanceSinceLastMarker = 0;
      }
    });

    return {
      fullTrackPositions,
      coloredSegmentsWithMarkers: segmentsWithMarkers,
    };
  }, [
    currentTrack,
    mapMode,
    valueRanges,
    zoomLevel,
    highlightMode,
    highlightRange,
    dispatch,
  ]);

  if (!coloredSegmentsWithMarkers) return null;

  const darkPolyline = (
    <Polyline
      positions={fullTrackPositions}
      color="#000000"
      opacity={0.7}
      weight={12}
    />
  );

  return (
    <LayerGroup>
      {darkPolyline}
      {coloredSegmentsWithMarkers}
      {!isHoveringOverPolyline && hoverMarkerPos && ( // Hide tooltip when hovering over polyline
        <Marker
          position={hoverMarkerPos}
          icon={createDistanceMarkerIcon()}
          zIndexOffset={1000}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
            opacity={1}
            permanent
            sticky
            className="tooltip-transition"
          >
            <div>
              {hoveredDistance
                ? `${(hoveredDistance/1000).toFixed(2)} km`
                : "N/A"}
            </div>
          </Tooltip>
        </Marker>
      )}
    </LayerGroup>
  );
};

export default ColorizedPolyline;
