import { useState, useEffect, useMemo } from "react";
import { Polyline, LayerGroup, Marker, useMap } from "react-leaflet";
import { DivIcon, LatLngTuple } from "leaflet";
import getColorForValue from "../../../utils/getColorForValue";
import haversineDistance from "../../../utils/haversineDistance";
import "./ColorizedPolyline.css";
import { useGlobalState } from "../../../context/GlobalContext";
import { calculateBearing } from "../../../utils/calculateBearing";

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
  const { state } = useGlobalState();
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  const {
    gpxData,
    mapMode,
    currentTrackIndex,
    highlightMode,
    highlightRange,
    valueRanges,
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

    const { minValue, maxValue } = valueRanges[mapMode]; // Ensure correct access to valueRanges
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
      let color =
        minValue === maxValue
          ? "blue"
          : getColorForValue(value, minValue, maxValue, mapMode === "curve");
      let opacity = 1;

      if (
        highlightMode &&
        (value < highlightRange[0] || value > highlightRange[1])
      ) {
        opacity = 0.05;
      }

      const segmentDistanceKm =
        haversineDistance(startPos[0], startPos[1], endPos[0], endPos[1]) /
        1000;
      distanceSinceLastMarker += segmentDistanceKm;

      segmentsWithMarkers.push(
        <Polyline
          key={`colored-segment-${pointIdx}-${mapMode}`}
          positions={[startPos, endPos]}
          color={color}
          opacity={opacity}
          weight={6}
          className="polyline-transition"
        />
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
    valueRanges, // Include this to ensure changes trigger recalculation
    zoomLevel,
    highlightMode,
    highlightRange,
  ]);

  if (!coloredSegmentsWithMarkers) return null;

  // Render dark background polyline
  const darkPolyline = (
    <Polyline
      positions={fullTrackPositions}
      color="#000000"
      opacity={0.5}
      weight={12}
    />
  );

  return (
    <LayerGroup>
      {darkPolyline}
      {coloredSegmentsWithMarkers}
    </LayerGroup>
  );
};

export default ColorizedPolyline;
