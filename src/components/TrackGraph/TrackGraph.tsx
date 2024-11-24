import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChartLine, FaChevronDown } from "react-icons/fa";
import "./TrackGraph.css";
import { useGlobalState } from "../../context/GlobalContext";
import getColorForValue from "../../utils/getColorForValue";
import haversineDistance from "../../utils/haversineDistance";
import {
  setHoveredDistance,
  setMapZoom,
  focusOnCoordinate,
  setIsProgrammaticMove,
} from "../../context/actions";

const TrackGraph: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const {
    gpxData,
    mapMode,
    currentTrackIndex,
    focusedWaypointIndex,
    valueRanges,
    hoveredDistance,
  } = state;
  const graphHeight: number = 85;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const graphData = useMemo(() => {
    if (!gpxData || currentTrackIndex === null) return null;

    const currentTrack = gpxData.tracks[currentTrackIndex];
    if (!currentTrack || currentTrack.points.length < 2) return null;

    const { minValue, maxValue } = valueRanges[mapMode];
    const sampledData: {
      distance: number;
      value: number;
      lat: number;
      lon: number;
      color: string;
    }[] = [];

    let totalDistance = 0;
    currentTrack.points.slice(1).forEach((point, idx) => {
      const prevPoint = currentTrack.points[idx];
      const segmentDistance = haversineDistance(
        parseFloat(prevPoint.lat),
        parseFloat(prevPoint.lon),
        parseFloat(point.lat),
        parseFloat(point.lon)
      );
      totalDistance += segmentDistance;
    });

    const sampleInterval = totalDistance / width;
    let accumulatedDistance = 0;
    let currentSampleDistance = 0;

    currentTrack.points.slice(1).forEach((point, idx) => {
      const prevPoint = currentTrack.points[idx];
      const segmentDistance = haversineDistance(
        parseFloat(prevPoint.lat),
        parseFloat(prevPoint.lon),
        parseFloat(point.lat),
        parseFloat(point.lon)
      );
      accumulatedDistance += segmentDistance;

      while (accumulatedDistance >= currentSampleDistance) {
        const ratio =
          (currentSampleDistance - (accumulatedDistance - segmentDistance)) /
          segmentDistance;

        const interpolatedValue = ((1 - ratio) * (prevPoint[mapMode] ?? 0) +
          ratio * (point[mapMode] ?? 0)) as number;

        const interpolatedLat =
          (1 - ratio) * parseFloat(prevPoint.lat) +
          ratio * parseFloat(point.lat);
        const interpolatedLon =
          (1 - ratio) * parseFloat(prevPoint.lon) +
          ratio * parseFloat(point.lon);

        const color =
          minValue === maxValue
            ? "blue"
            : getColorForValue(interpolatedValue, minValue, maxValue);

        sampledData.push({
          distance: currentSampleDistance,
          value: interpolatedValue,
          lat: interpolatedLat,
          lon: interpolatedLon,
          color,
        });

        currentSampleDistance += sampleInterval;
      }
    });

    return sampledData;
  }, [gpxData, currentTrackIndex, mapMode, valueRanges, width]);

  const waypointsData = useMemo(() => {
    if (!gpxData || currentTrackIndex === null || width === 0) {
      console.log("No GPX data, invalid track index, or width is zero.");
      return [];
    }

    const currentTrack = gpxData.tracks[currentTrackIndex];
    if (!currentTrack || currentTrack.waypoints.length === 0) {
      console.log("No current track or no waypoints in the track.");
      return [];
    }

    const totalDistance =
      currentTrack.points[currentTrack.points.length - 1]?.distanceFromStart ||
      0;

    if (totalDistance === 0) {
      console.log("Total distance is zero, unable to scale waypoints.");
      return [];
    }

    console.log("Graph Width:", width);
    console.log("Total Track Distance (meters):", totalDistance);

    return currentTrack.waypoints.map((waypoint, idx) => {
      const distanceFromStart = (waypoint.distanceFromStart || 0) * 1000; // Convert kilometers to meters
      const x = (distanceFromStart / totalDistance) * width;

      const closestPointIndex = waypoint.closestTrackPointIndex || 0;
      const lat = parseFloat(
        currentTrack.points[closestPointIndex]?.lat || "0"
      );
      const lon = parseFloat(
        currentTrack.points[closestPointIndex]?.lon || "0"
      );

      console.log(`Waypoint ${idx}:`, {
        distanceFromStart,
        x,
        lat,
        lon,
      });

      return { x, lat, lon };
    });
  }, [gpxData, currentTrackIndex, width]);

  const handleMouseDown = (event: React.MouseEvent<SVGElement>) => {
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!graphData) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const relativeDistance =
      (x / width) * graphData[graphData.length - 1].distance;

    const closestPoint = graphData.reduce((prev, curr) => {
      return Math.abs(curr.distance - relativeDistance) <
        Math.abs(prev.distance - relativeDistance)
        ? curr
        : prev;
    });

    setHoverX(x);
    setHoverValue(closestPoint.value);

    let calculatedY =
      graphHeight -
      ((closestPoint.value - valueRanges[mapMode].minValue) /
        (valueRanges[mapMode].maxValue - valueRanges[mapMode].minValue)) *
        graphHeight;

    calculatedY = Math.max(20, Math.min(calculatedY, graphHeight - 5));

    setTooltipY(calculatedY);

    // Only dispatch map updates when dragging
    if (isDragging) {
      dispatch(setHoveredDistance(relativeDistance));
      dispatch(setIsProgrammaticMove(true));
      dispatch(setMapZoom(13));
      dispatch(focusOnCoordinate([closestPoint.lat, closestPoint.lon]));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverValue(null);
    dispatch(setHoveredDistance(null));
  };

  const handleGraphClick = (event: React.MouseEvent<SVGElement>) => {
    if (!graphData) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const relativeDistance =
      (x / width) * graphData[graphData.length - 1].distance;

    const closestPoint = graphData.reduce((prev, curr) => {
      return Math.abs(curr.distance - relativeDistance) <
        Math.abs(prev.distance - relativeDistance)
        ? curr
        : prev;
    });

    dispatch(setIsProgrammaticMove(true));
    dispatch(setMapZoom(15));
    dispatch(focusOnCoordinate([closestPoint.lat, closestPoint.lon]));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`track-graph-wrapper ${isCollapsed ? "collapsed" : ""}`}
      onMouseUp={handleMouseUp} // Ensure dragging stops when mouse is released
    >
      <button className="collapse-button" onClick={toggleCollapse}>
        {isCollapsed ? <FaChartLine size={16} /> : <FaChevronDown size={16} />}
      </button>
      {!isCollapsed && (
        <div className="track-graph-container" ref={containerRef}>
          <svg
            className="track-graph-svg"
            width={width}
            height={graphHeight + 10} // Add padding for triangles
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onClick={handleGraphClick}
          >
            {graphData &&
              graphData.map((point, idx) => {
                if (idx === 0) return null;
                const prevPoint = graphData[idx - 1];
                const x1 =
                  (prevPoint.distance /
                    graphData[graphData.length - 1].distance) *
                  width;
                const y1 =
                  graphHeight -
                  ((prevPoint.value - valueRanges[mapMode].minValue) /
                    (valueRanges[mapMode].maxValue -
                      valueRanges[mapMode].minValue)) *
                    graphHeight;
                const x2 =
                  (point.distance / graphData[graphData.length - 1].distance) *
                  width;
                const y2 =
                  graphHeight -
                  ((point.value - valueRanges[mapMode].minValue) /
                    (valueRanges[mapMode].maxValue -
                      valueRanges[mapMode].minValue)) *
                    graphHeight;

                return (
                  <line
                    key={`graph-line-${idx}`}
                    x1={x1}
                    y1={y1 + 5}
                    x2={x2}
                    y2={y2 + 5}
                    stroke={point.color}
                    strokeWidth="4"
                  />
                );
              })}

            {/* Render waypoint triangles */}
            {waypointsData.map((waypoint, idx) => (
              <polygon
                key={`waypoint-${idx}`}
                points={`${waypoint.x - 5},${graphHeight + 10} ${
                  waypoint.x + 5
                },${graphHeight + 10} ${waypoint.x},${graphHeight + 5}`}
                fill={idx === focusedWaypointIndex ? "red" : "rgb(54, 217, 0)"} // Conditional coloring
              />
            ))}

            {hoverX !== null && (
              <>
                <line
                  x1={hoverX}
                  y1={0}
                  x2={hoverX}
                  y2={graphHeight}
                  stroke="red"
                  strokeDasharray="4"
                />
                {hoverValue !== null && (
                  <text
                    x={hoverX}
                    y={tooltipY - 10}
                    fill="black"
                    fontSize="12"
                    className={"tooltip"}
                  >
                    {hoverValue.toFixed(2)}
                  </text>
                )}
              </>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};

export default TrackGraph;
