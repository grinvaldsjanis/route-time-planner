import React, { useEffect, useRef } from "react";
import { useGlobalState } from "../../context/GlobalContext";
import {
  startPlayback,
  stopPlayback,
  setPlaybackPosition,
  setPlaybackSpeed,
  setCalculatedSpeed,
} from "../../context/actions";
import { FaPlay, FaPause } from "react-icons/fa6";
import { FaFastBackward } from "react-icons/fa";
import style from "./PlaybackController.module.css";

const PlaybackController: React.FC = () => {
  const { state, dispatch } = useGlobalState();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<number>(state.playbackPosition);

  const handlePlay = () => {
    // console.log("Starting playback...");
    // console.log("GPX Data:", state.gpxData);
    dispatch(startPlayback());
  };

  const handlePause = () => {
    dispatch(stopPlayback());
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleRewind = () => {
    dispatch(stopPlayback());
    dispatch(setPlaybackPosition(0)); // Reset position
  };

  const handleSpeedChange = (speedMultiplier: number) => {
    dispatch(setPlaybackSpeed(speedMultiplier));
  };

  const calculateIncrement = (): number => {
    const { playbackPosition, currentTrackIndex, gpxData, playbackSpeed } =
      state;

    if (!gpxData || currentTrackIndex === null) {
      console.warn("Missing GPX data or invalid track index.");
      return 0;
    }

    const track = gpxData.tracks[currentTrackIndex];
    const trackPoints = track.points;

    if (trackPoints.length < 2) {
      console.warn("Not enough track points to calculate increment.");
      return 0;
    }

    // console.log("Playback Position:", playbackPosition);

    for (let i = 0; i < trackPoints.length - 1; i++) {
      const pointA = trackPoints[i];
      const pointB = trackPoints[i + 1];
      const distanceA = pointA.distanceFromStart || 0;
      const distanceB = pointB.distanceFromStart || 0;

      if (playbackPosition >= distanceA && playbackPosition <= distanceB) {
        const segmentLength = distanceB - distanceA;

        if (segmentLength === 0) {
          console.warn("Zero segment length between points:", pointA, pointB);
          return 0;
        }

        const positionRatio = (playbackPosition - distanceA) / segmentLength;

        const speedA = pointA.calculatedSpeed ?? 0; // Speed at point A
        const speedB = pointB.calculatedSpeed ?? 0; // Speed at point B

        const interpolatedSpeed = speedA + positionRatio * (speedB - speedA);

        if (interpolatedSpeed <= 0) {
          console.warn("Interpolated speed is zero or negative:", {
            speedA,
            speedB,
            positionRatio,
          });
        }

        dispatch(setCalculatedSpeed(interpolatedSpeed)); // Update calculated speed

        const increment = ((interpolatedSpeed * 1000) / 3600) * playbackSpeed;

        if (increment <= 0) {
          console.warn("Increment is zero or negative:", {
            interpolatedSpeed,
            playbackSpeed,
            increment,
          });
        }

        return increment;
      }
    }

    console.warn("Playback position not within track point range.");
    return 0;
  };

  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        const increment = calculateIncrement();
        const newPosition = state.playbackPosition + increment;

        if (newPosition >= state.totalDistance) {
          dispatch(stopPlayback());
          dispatch(setPlaybackPosition(state.totalDistance));
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        } else {
          dispatch(setPlaybackPosition(newPosition));
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    state.isPlaying,
    state.playbackSpeed,
    state.totalDistance,
    state.currentTrackIndex,
    state.gpxData,
    state.travelMode,
    dispatch,
  ]);

  // Synchronize with external playback position updates
  useEffect(() => {
    if (!state.isPlaying) {
      lastPositionRef.current = state.playbackPosition;
    } else if (state.playbackPosition !== lastPositionRef.current) {
      //   console.log("External position update detected. Resetting playback...");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      lastPositionRef.current = state.playbackPosition;
      intervalRef.current = setInterval(() => {
        const increment = calculateIncrement();
        const newPosition = state.playbackPosition + increment;

        if (newPosition >= state.totalDistance) {
          dispatch(stopPlayback());
          dispatch(setPlaybackPosition(state.totalDistance));
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        } else {
          dispatch(setPlaybackPosition(newPosition));
        }
      }, 1000);
    }
  }, [state.playbackPosition, state.isPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isPlaying) {
        handlePause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isPlaying]);

  return (
    <div className={style.playback_controller}>
      <div className={style.player_buttons}>
        <button onClick={handleRewind}>
          <FaFastBackward />
        </button>
        <button onClick={state.isPlaying ? handlePause : handlePlay}>
          {state.isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>
      <div className={style.info}>
        {(state.playbackPosition / 1000).toFixed(1)} km{" - "}
        {state.calculatedSpeed.toFixed(1)} km/h
      </div>
      <div className={style.speed_buttons}>
        <button
          className={state.playbackSpeed === 1 ? style.active : ""}
          onClick={() => handleSpeedChange(1)}
        >
          1x
        </button>
        <button
          className={state.playbackSpeed === 10 ? style.active : ""}
          onClick={() => handleSpeedChange(10)}
        >
          10x
        </button>
        <button
          className={state.playbackSpeed === 50 ? style.active : ""}
          onClick={() => handleSpeedChange(50)}
        >
          50x
        </button>
      </div>
    </div>
  );
};

export default PlaybackController;
