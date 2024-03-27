import { LatLngTuple } from "leaflet";

export default function calculateAngle(p1:LatLngTuple, p2:LatLngTuple, p3:LatLngTuple) {
    // Convert lat/lon from degrees to radians
    function toRadians(degrees: number) {
        return degrees * Math.PI / 180;
    }

    // Calculate bearing between two points
    function calculateBearing(start: LatLngTuple, end: LatLngTuple) {
        const startLat = toRadians(start[0]), startLng = toRadians(start[1]);
        const endLat = toRadians(end[0]), endLng = toRadians(end[1]);
        const dLng = endLng - startLng;

        const bearing = Math.atan2(Math.sin(dLng) * Math.cos(endLat),
            Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng));
        return (bearing + 2 * Math.PI) % (2 * Math.PI); // Normalize to 0-360 degrees
    }

    const bearingAB = calculateBearing(p1, p2);
    const bearingBC = calculateBearing(p2, p3);

    // Calculate the angle in degrees
    let angle = (bearingBC - bearingAB) * (180 / Math.PI);
    angle = (angle + 360) % 360; // Normalize to 0-360 degrees
    return angle;
}