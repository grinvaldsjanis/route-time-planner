import L from "leaflet";

const createVehicleMarker = (modeDetails: {
  iconColor: string;
  IconComponent: React.ComponentType<{ color: string; style?: React.CSSProperties }>;
}) => {
  const { iconColor, IconComponent } = modeDetails;

  // Create SVG icon string manually
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${iconColor}">
      <text x="12" y="20" font-size="12px" text-anchor="middle" fill="white">
        ?
      </text>
    </svg>
  `;

  return L.divIcon({
    className: "custom-vehicle-marker",
    html: `<div style="display: flex; justify-content: center; align-items: center;">${iconSvg}</div>`,
    iconSize: [30, 30], // The size of the icon container
    iconAnchor: [15, 30], // Anchor the marker at the bottom-center
  });
};

export default createVehicleMarker;
