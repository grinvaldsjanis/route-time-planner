import { LatLngTuple } from "leaflet";

export default function calculateAngle(p1:LatLngTuple, p2:LatLngTuple, p3:LatLngTuple) {
    function toRadians(degrees: number) {
        return degrees * Math.PI / 180;
    }

    function calculateBearing(start: LatLngTuple, end: LatLngTuple) {
        const startLat = toRadians(start[0]), startLng = toRadians(start[1]);
        const endLat = toRadians(end[0]), endLng = toRadians(end[1]);
        const dLng = endLng - startLng;

        const bearing = Math.atan2(Math.sin(dLng) * Math.cos(endLat),
            Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng));
        return (bearing + 2 * Math.PI) % (2 * Math.PI);
    }

    const bearingAB = calculateBearing(p1, p2);
    const bearingBC = calculateBearing(p2, p3);

    let angle = (bearingBC - bearingAB) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    return angle;
}