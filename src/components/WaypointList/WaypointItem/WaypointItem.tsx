import React, { useState, useEffect } from "react";
import { useGlobalState } from "../../../context/GlobalContext";
import "./WaypointItem.css";
import {
  LuArrowDownFromLine,
  LuArrowDownToLine,
  LuClock,
  LuArrowRightFromLine,
} from "react-icons/lu";
import EditableText from "../../EditableText/EditableText";
import StopTimeSelector from "../StopTimeSelector/StopTimeSelector";
import { LatLngTuple } from "leaflet";
import {
  setMapCenter,
  setFocusedWaypoint,
  setIsProgrammaticMove,
  setMapZoom,
  setProgrammaticAction,
} from "../../../context/actions";
import {
  formatTimeFromSeconds,
  minutesToSeconds,
} from "../../../utils/timeUtils";
import { FaGoogle, FaWikipediaW } from "react-icons/fa6";
import { imageService } from "../../../utils/globalImageService";

interface WaypointItemProps {
  index: number;
}

const WaypointItem: React.FC<WaypointItemProps> = ({ index }) => {
  const { state, dispatch } = useGlobalState();

  const [editableName, setEditableName] = useState<string>(
    `Point ${index + 1}`
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageUnavailable, setIsImageUnavailable] = useState(false);
  const [isPending, setIsPending] = useState(true);

  const [startHour, startMinute] = state.startTime.split(":").map(Number);
  const startTimeSeconds = minutesToSeconds(startHour * 60 + startMinute);

  const currentTrack =
    state.gpxData && state.currentTrackIndex !== null
      ? state.gpxData.tracks[state.currentTrackIndex]
      : null;

  const trackWaypoint = currentTrack?.waypoints[index] ?? null;
  const referenceWaypoint = trackWaypoint
    ? state.gpxData?.referenceWaypoints.find(
        (refWaypoint) => refWaypoint.id === trackWaypoint.referenceId
      )
    : null;

  useEffect(() => {
    if (trackWaypoint) {
      setEditableName(referenceWaypoint?.name || `Point ${index + 1}`);
    }
  }, [referenceWaypoint, index, state.gpxData]);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      if (
        referenceWaypoint &&
        referenceWaypoint.lat &&
        referenceWaypoint.lon &&
        !imageUrl &&
        !isImageUnavailable
      ) {
        setIsPending(true); // Mark as pending
        try {
          const response = await imageService.fetchImage(
            { lat: referenceWaypoint.lat, lon: referenceWaypoint.lon },
            800,
            3, // 3 retries
            2000 // 2-second delay between retries
          );

          if (isMounted) {
            if (response.imageUrl) {
              setImageUrl(response.imageUrl);
              dispatch({
                type: "SET_WAYPOINT_IMAGE",
                payload: {
                  index,
                  imageUrl: response.imageUrl,
                },
              });
            } else {
              setIsImageUnavailable(true);
            }
          }
        } catch (error) {
          if (isMounted) {
            setIsImageUnavailable(true);
          }
        } finally {
          if (isMounted) {
            setIsPending(false); // Mark as complete
          }
        }
      } else {
        setIsPending(false); // No need to fetch
      }
    };

    fetchImage();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [referenceWaypoint, imageUrl, isImageUnavailable, index, dispatch]);

  const arrivalTime = trackWaypoint
    ? formatTimeFromSeconds(
        (trackWaypoint.relativeTimes?.arrivalSeconds ?? 0) + startTimeSeconds
      )
    : formatTimeFromSeconds(startTimeSeconds);

  const departureTime = trackWaypoint
    ? formatTimeFromSeconds(
        (trackWaypoint.relativeTimes?.departureSeconds ?? 0) + startTimeSeconds
      )
    : formatTimeFromSeconds(startTimeSeconds);

  const stopTime = trackWaypoint?.stopTime ?? 0;

  const formatDistance = (distance: number) => {
    return distance >= 10 ? Math.round(distance) : distance.toFixed(1);
  };

  const distanceFromStart = formatDistance(
    trackWaypoint?.distanceFromStart
      ? trackWaypoint.distanceFromStart / 1000
      : 0
  );

  const distanceToEnd = formatDistance(
    trackWaypoint?.distanceToEnd ? trackWaypoint.distanceToEnd / 1000 : 0
  );

  const handleStopTimeChange = (stopTime: number) => {
    if (trackWaypoint) {
      dispatch({ type: "UPDATE_STOP_TIME", payload: { index, stopTime } });
    }
  };

  const handleSetMapCenter = () => {
    if (referenceWaypoint && referenceWaypoint.type !== "shaping") {
      const newCenter: LatLngTuple = [
        parseFloat(referenceWaypoint.lat),
        parseFloat(referenceWaypoint.lon),
      ];

      console.log(`Clicked waypoint index: ${index}, referenceId: ${trackWaypoint?.referenceId}`);
      console.log(`Expected map center:`, newCenter);
      dispatch(setFocusedWaypoint(index));
      dispatch(setProgrammaticAction("focusWaypoint"));
      dispatch(setMapCenter(newCenter));
      dispatch(setMapZoom(15));
      dispatch(setIsProgrammaticMove(true));
    }
  };

  const isActive = state.focusedWaypointIndex === index;

  if (!currentTrack || !trackWaypoint || !referenceWaypoint) {
    return <div>No GPX data available.</div>;
  }

  const wikipediaLink = `https://wikinearby.toolforge.org/?lang=en&q=${referenceWaypoint.lat},${referenceWaypoint.lon}`;
  const googlePlacesLink = `https://www.google.com/maps/search/?api=1&query=${referenceWaypoint.lat},${referenceWaypoint.lon}`;

  let timeInfo;
  if (referenceWaypoint.type === "start") {
    timeInfo = (
      <div>
        <LuArrowDownFromLine /> {departureTime}
      </div>
    );
  } else if (referenceWaypoint.type === "destination") {
    timeInfo = (
      <div>
        <LuArrowDownToLine /> {arrivalTime}
      </div>
    );
  } else {
    timeInfo =
      stopTime > 0 ? (
        <div className="arrival-departure">
          <div className="time-info-row">
            <LuArrowDownToLine /> {arrivalTime}
          </div>
          <div className="time-info-row">
            <LuArrowDownFromLine /> {departureTime}
          </div>
        </div>
      ) : (
        <div className="time-info-row">
          <LuClock /> {arrivalTime}
        </div>
      );
  }

  return (
    <li
      className="list-item"
      id={`waypoint-${index}`}
      key={`waypoint-${index}`}
      onClick={handleSetMapCenter}
    >
      <div className="waypoint-container">
        <div className="waypoint-front-container">
          <div className="item-order-number">{index + 1}</div>
        </div>

        <div
          className={`waypoint-info-container ${isActive ? "active" : ""} ${
            isPending
              ? "waypoint-pending"
              : !imageUrl && !isImageUnavailable
              ? "waypoint-awaiting-image"
              : isImageUnavailable
              ? "waypoint-no-image"
              : ""
          }`}
          id={`waypoint-info-${index}`}
          style={{
            backgroundColor:
              stopTime > 0 ? "rgb(214, 245, 161)" : "rgb(241, 241, 241)",
            position: "relative",
          }}
        >
          {imageUrl && (
            <div
              className={`background-image-overlay image-appearing`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(214, 245, 161, 0.2) 20%, rgba(214, 245, 161, 1)), url(${imageUrl})`,
              }}
            />
          )}
          {referenceWaypoint.type !== "shaping" && (
            <div className="item-top-row">
              <EditableText
                className={"item-name"}
                text={editableName}
                onTextChange={(newName) => {
                  setEditableName(newName);
                  dispatch({
                    type: "SET_WAYPOINT_NAME",
                    payload: { index, name: newName }, // Update global state
                  });
                }}
              />
              <a
                href={wikipediaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="wikipedia-link"
              >
                <FaWikipediaW />
              </a>
              <a
                href={googlePlacesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="wikipedia-link"
              >
                <FaGoogle />
              </a>
            </div>
          )}
          <div className="waypoint-time-container">
            {referenceWaypoint.type !== "start" &&
              referenceWaypoint.type !== "destination" &&
              referenceWaypoint.type !== "shaping" && (
                <StopTimeSelector
                  key={`stop-selector-${index}-${stopTime}`}
                  stopTime={stopTime}
                  handleStopTimeChange={handleStopTimeChange}
                />
              )}
            <div className="timeinfo-wrapper">{timeInfo}</div>
          </div>
          <div className="waypoint-distance-container">
            {referenceWaypoint.type === "start" && (
              <div className="item-distance">
                <LuArrowRightFromLine />
                {distanceToEnd} km
              </div>
            )}
            {referenceWaypoint.type === "destination" && (
              <div className="item-distance">
                {distanceFromStart} km
                <LuArrowRightFromLine />
              </div>
            )}
            {referenceWaypoint.type !== "start" &&
              referenceWaypoint.type !== "destination" &&
              referenceWaypoint.type !== "shaping" && (
                <>
                  <div className="item-distance">
                    <LuArrowRightFromLine />
                    {distanceFromStart} km
                  </div>
                  <div className="item-distance">
                    - {distanceToEnd} km
                    <LuArrowRightFromLine />
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default WaypointItem;