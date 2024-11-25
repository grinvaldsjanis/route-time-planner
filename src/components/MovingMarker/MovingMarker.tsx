import React, { useEffect, useState, useMemo } from "react";
import { Marker } from "react-leaflet";
import { LatLngTuple, divIcon } from "leaflet";
import { useGlobalState } from "../../context/GlobalContext";
import { focusOnCoordinate } from "../../context/actions";

const MovingMarker: React.FC<{ microStepCount?: number }> = ({
  microStepCount = 3,
}) => {
  const { state, dispatch } = useGlobalState();
  const {
    gpxData,
    currentTrackIndex,
    playbackPosition,
    playbackSpeed,
    calculatedSpeed,
    isPlaying,
  } = state;

  const [currentCoordinate, setCurrentCoordinate] =
    useState<LatLngTuple | null>(null);

  const [currentDistance, setCurrentDistance] =
    useState<number>(playbackPosition);

  const lastPlaybackPositionRef = React.useRef<number>(playbackPosition);

  const getCoordinateAtDistance = (
    distanceFromStart: number
  ): LatLngTuple | null => {
    if (!gpxData || currentTrackIndex === null) return null;

    const currentTrack = gpxData.tracks[currentTrackIndex];
    if (!currentTrack || currentTrack.points.length < 2) {
      return null;
    }

    const trackPoints = currentTrack.points;

    for (let i = 0; i < trackPoints.length - 1; i++) {
      const pointA = trackPoints[i];
      const pointB = trackPoints[i + 1];
      const distanceA = pointA.distanceFromStart || 0;
      const distanceB = pointB.distanceFromStart || 0;

      if (distanceFromStart >= distanceA && distanceFromStart <= distanceB) {
        const segmentLength = distanceB - distanceA;

        if (segmentLength === 0) {
          console.error("Invalid segment length: 0");
          return null;
        }

        const ratio = (distanceFromStart - distanceA) / segmentLength;

        const latA = parseFloat(pointA.lat);
        const lonA = parseFloat(pointA.lon);
        const latB = parseFloat(pointB.lat);
        const lonB = parseFloat(pointB.lon);

        if (isNaN(latA) || isNaN(lonA) || isNaN(latB) || isNaN(lonB)) {
          console.error("Invalid lat/lon values in track points:", {
            pointA,
            pointB,
          });
          return null;
        }

        const lat = (1 - ratio) * latA + ratio * latB;
        const lon = (1 - ratio) * lonA + ratio * lonB;

        return [lat, lon];
      }
    }

    return null;
  };

  useEffect(() => {
    const isPaused = !isPlaying;
    const distanceDelta = playbackPosition - lastPlaybackPositionRef.current;

    if (isPaused && distanceDelta !== 0) {
      // Immediately move to the new playbackPosition when paused
      setCurrentDistance(playbackPosition);
      const coordinate = getCoordinateAtDistance(playbackPosition);
      if (coordinate) {
        setCurrentCoordinate(coordinate);
        dispatch(focusOnCoordinate(coordinate));
      }
    }
  }, [playbackPosition, isPlaying, gpxData, currentTrackIndex, dispatch]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const totalSteps = microStepCount;
    const intervalDuration = 1000 / totalSteps; // Total interval split into steps
    const distanceDelta = playbackPosition - currentDistance;
    const stepDistance = distanceDelta / totalSteps;

    let stepsTaken = 0;
    let newDistance = currentDistance;

    const interval = setInterval(() => {
      if (stepsTaken >= totalSteps) {
        clearInterval(interval);
        return;
      }

      newDistance += stepDistance;

      const newCoordinate = getCoordinateAtDistance(newDistance);
      if (newCoordinate) {
        setCurrentDistance(newDistance);
        setCurrentCoordinate(newCoordinate);
        dispatch(focusOnCoordinate(newCoordinate));
      }

      stepsTaken++;
    }, intervalDuration);

    lastPlaybackPositionRef.current = playbackPosition;

    return () => clearInterval(interval);
  }, [
    isPlaying,
    playbackPosition,
    playbackSpeed,
    calculatedSpeed,
    currentDistance,
    microStepCount,
    gpxData,
    currentTrackIndex,
    dispatch,
  ]);

  const simpleRedCircleIcon = useMemo(
    () =>
      divIcon({
        className: "custom-red-circle",
        html: `<div style="width: 20px; z-index: 800; height: 20px; background-color: orange; border-radius: 50%; border: 2px solid black;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [10, 10],
      }),
    [microStepCount]
  );

  if (!currentCoordinate) return null;

  return <Marker position={currentCoordinate} icon={simpleRedCircleIcon} />;
};

export default MovingMarker;
