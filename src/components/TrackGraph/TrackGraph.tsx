import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TrackGraph.css";
import { useGlobalState } from "../../context/GlobalContext";
import getColorForValue from "../../utils/getColorForValue";
import haversineDistance from "../../utils/haversineDistance";
import { setHoveredDistance } from "../../context/actions";

const TrackGraph: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  const { gpxData, mapMode, currentTrackIndex, valueRanges } = state;

  // Recalculate graph width on window resize
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
    const sampledData: { distance: number; value: number; color: string }[] =
      [];

    // Total distance along the track
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

    // Sample data at regular intervals
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

        const color =
          minValue === maxValue
            ? "blue"
            : getColorForValue(interpolatedValue, minValue, maxValue);

        sampledData.push({
          distance: currentSampleDistance,
          value: interpolatedValue,
          color,
        });

        currentSampleDistance += sampleInterval;
      }
    });

    return sampledData;
  }, [gpxData, currentTrackIndex, mapMode, valueRanges, width]);

  if (!graphData || graphData.length === 0) return null;

  const { minValue, maxValue } = valueRanges[mapMode];

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left; // Mouse X position relative to the graph
    const relativeDistance =
      (x / width) * graphData[graphData.length - 1].distance;

    dispatch(setHoveredDistance(relativeDistance)); // Dispatch hover distance
  };

  const handleMouseLeave = () => {
    dispatch(setHoveredDistance(null)); // Clear hover state
  };

  return (
    <div className="track-graph-container" ref={containerRef}>
      <svg
        className="track-graph-svg"
        width={width}
        height="80"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {graphData.map((point, idx) => {
          if (idx === 0) return null;
          const prevPoint = graphData[idx - 1];
          const x1 =
            (prevPoint.distance / graphData[graphData.length - 1].distance) *
            width;
          const y1 =
            80 - ((prevPoint.value - minValue) / (maxValue - minValue)) * 80;
          const x2 =
            (point.distance / graphData[graphData.length - 1].distance) * width;
          const y2 =
            80 - ((point.value - minValue) / (maxValue - minValue)) * 80;

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
      </svg>
    </div>
  );
};

export default TrackGraph;
