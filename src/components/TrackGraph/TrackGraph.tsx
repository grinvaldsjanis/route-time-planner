import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChartLine, FaChevronDown } from "react-icons/fa";
import "./TrackGraph.css";
import { useGlobalState } from "../../context/GlobalContext";
import getColorForValue from "../../utils/getColorForValue";
import haversineDistance from "../../utils/haversineDistance";
import {
  setHoveredDistance,
  setMapCenter,
  setMapZoom,
  focusOnCoordinate,
  setIsProgrammaticMove, // Import the action
} from "../../context/actions";

const TrackGraph: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const { gpxData, mapMode, currentTrackIndex, valueRanges, hoveredDistance } =
    state;
  const graphHeight: number = 70;

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

  useEffect(() => {
    if (!graphData || hoveredDistance === null) return;

    // Ensure hoveredDistance is clamped within the graph's range
    const clampedDistance = Math.min(
      Math.max(hoveredDistance, 0),
      graphData[graphData.length - 1].distance
    );

    const closestPoint = graphData.reduce((prev, curr) => {
      return Math.abs(curr.distance - clampedDistance) <
        Math.abs(prev.distance - clampedDistance)
        ? curr
        : prev;
    });

    const x =
      (closestPoint.distance / graphData[graphData.length - 1].distance) *
      width;
    const y =
      graphHeight -
      ((closestPoint.value - valueRanges[mapMode].minValue) /
        (valueRanges[mapMode].maxValue - valueRanges[mapMode].minValue)) *
        graphHeight;

    setHoverX(x);
    setHoverValue(closestPoint.value);
    setTooltipY(Math.max(20, Math.min(y, graphHeight - 5)));
  }, [hoveredDistance, graphData, width, graphHeight, valueRanges, mapMode]);

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

    dispatch(setHoveredDistance(relativeDistance));
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
  
    // Dispatch actions to center the map and set the zoom level
    dispatch(setIsProgrammaticMove(true));
    dispatch(setMapZoom(15));
    dispatch(focusOnCoordinate([closestPoint.lat, closestPoint.lon])); // Use closestPoint
    console.log("Click made on track graph and state dispatched");
  };
  

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`track-graph-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      <button className="collapse-button" onClick={toggleCollapse}>
        {isCollapsed ? <FaChartLine size={16} /> : <FaChevronDown size={16} />}
      </button>
      {!isCollapsed && (
        <div className="track-graph-container" ref={containerRef}>
          <svg
            className="track-graph-svg"
            width={width}
            height={graphHeight}
            onMouseMove={handleMouseMove}
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
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={point.color}
                    strokeWidth="4"
                  />
                );
              })}

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
