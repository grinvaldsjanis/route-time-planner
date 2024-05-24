import L from "leaflet";
import "leaflet/dist/leaflet.css";
import startIcon from "../images/icons/flag-solid.svg";
import destIcon from "../images/icons/flag-checkered-solid.svg";
import viaIcon from "../images/icons/location-pin-solid.svg";

export const createMarkerIcon = (type: string, index: number) => {
  switch (type) {
    case "start":
      return L.divIcon({
        className: "custom-start-icon",
        html: `<div style="width: 26px; height: 26px; background-image: url(${startIcon}); background-size: cover;"></div>`,
        iconSize: [35, 35],
        iconAnchor: [2, 26],
      });
    case "via":
      return L.divIcon({
        className: "custom-via-icon",
        html: `<div style="position: relative; width: 27px; height: 36px; background-image: url(${viaIcon});">
                   <span style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; font-size: 14px;">${index}</span>
                 </div>`,
        iconSize: [20, 36],
        iconAnchor: [14, 38],
      });

    case "shaping":
      return L.divIcon({
        className: "custom-shaping-icon",
        html: `<div style="border: 2px solid rgba(0, 0, 0, 0.61); background-color: rgba(211, 70, 255, 0.55); width: 8x; height: 8px; border-radius: 50%;"></div>`,
        iconSize: [12, 12],
      });
    case "destination":
      return L.divIcon({
        className: "custom-start-icon",
        html: `<div style="width: 26px; height: 26px; background-image: url(${destIcon}); background-size: cover;"></div>`,
        iconSize: [35, 35],
        iconAnchor: [2, 26],
      });
    default:
      return L.divIcon({
        className: "custom-shaping-icon",
        html: `<div style="background-color: green; width: 8px; height: 8px; border-radius: 50%;"></div>`,
        iconSize: [8, 8],
      });
  }
};
