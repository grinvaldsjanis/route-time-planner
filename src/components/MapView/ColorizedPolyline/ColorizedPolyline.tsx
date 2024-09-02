import { useMemo, useState, useEffect } from "react";
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
    iconSize: [20, 20],
    iconAnchor: [10, 14],
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

  const renderPolylineSegments = useMemo(() => {
    const currentTrack =
      currentTrackIndex !== null && gpxData?.tracks
        ? gpxData.tracks[currentTrackIndex]
        : null;
    if (!currentTrack || currentTrack.points.length < 2) return null;

    const modeKey = mapMode;
    const { minValue, maxValue } = valueRanges[modeKey]; // Correctly use the full range from valueRanges
    const markerSpacingKm = getMarkerSpacingByZoom(zoomLevel);
    let distanceSinceLastMarker = 0;

    return currentTrack.points.slice(1).map((point, pointIdx) => {
      const prevPoint = currentTrack.points[pointIdx];

      if (!prevPoint || !point) return null;

      const startPos: LatLngTuple = [
        parseFloat(prevPoint.lat),
        parseFloat(prevPoint.lon),
      ];
      const endPos: LatLngTuple = [
        parseFloat(point.lat),
        parseFloat(point.lon),
      ];

      const value = ((prevPoint[modeKey] ?? 0) + (point[modeKey] ?? 0)) / 2;

      let color;
      if (minValue === maxValue) {
        color = "blue";
      } else {
        color = getColorForValue(
          value,
          minValue,
          maxValue,
          mapMode === "curve"
        );
      }

      let opacity = 1;
      if (
        highlightMode &&
        (value < highlightRange[0] || value > highlightRange[1])
      ) {
        opacity = 0.05; // Reduce opacity for non-highlighted segments
      }

      // Use the external haversineDistance function
      const segmentDistanceKm =
        haversineDistance(startPos[0], startPos[1], endPos[0], endPos[1]) /
        1000; // Convert meters to kilometers
      distanceSinceLastMarker += segmentDistanceKm;

      const markers: JSX.Element[] = [];
      if (distanceSinceLastMarker >= markerSpacingKm) {
        const bearing = calculateBearing(startPos, endPos);
        markers.push(
          <Marker
            key={`marker-${pointIdx}`}
            position={endPos}
            icon={createDirectionalMarkerIcon(bearing)}
          />
        );
        distanceSinceLastMarker = 0;
      }

      return (
        <LayerGroup
          key={`${pointIdx}-${mapMode}-${highlightRange[0]}-${highlightRange[1]}-${highlightMode}`}
        >
          <Polyline
            key={`${pointIdx}-${color}-${opacity}`}
            positions={[startPos, endPos]}
            color={color}
            opacity={opacity}
            weight={4}
            className="polyline-transition"
          />
          {markers}
        </LayerGroup>
      );
    });
  }, [
    gpxData,
    mapMode,
    currentTrackIndex,
    highlightMode,
    highlightRange,
    zoomLevel,
    valueRanges,
  ]);

  return <LayerGroup>{renderPolylineSegments}</LayerGroup>;
};

export default ColorizedPolyline;
