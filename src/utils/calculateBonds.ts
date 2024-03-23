import { LatLngTuple } from "leaflet";
import { Waypoint } from "./parseGPX";

export const calculateBounds = (waypoints: Waypoint[]) => {
    if (!waypoints.length) return null;
  
    let minLat = parseFloat(waypoints[0].lat),
        maxLat = parseFloat(waypoints[0].lat),
        minLon = parseFloat(waypoints[0].lon),
        maxLon = parseFloat(waypoints[0].lon);
  
    waypoints.forEach(({ lat, lon }) => {
      const latitude = parseFloat(lat),
            longitude = parseFloat(lon);
  
      if (latitude < minLat) minLat = latitude;
      if (latitude > maxLat) maxLat = latitude;
      if (longitude < minLon) minLon = longitude;
      if (longitude > maxLon) maxLon = longitude;
    });
  
    return [[minLat, minLon], [maxLat, maxLon]] as [LatLngTuple, LatLngTuple];
  };
  