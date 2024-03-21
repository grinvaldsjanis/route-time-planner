declare module 'react-leaflet' {
    import { MapContainer as OriginalMapContainer } from 'react-leaflet';
    interface MapContainerProps extends OriginalMapContainer {
      center: [number, number];
    }
    export const MapContainer: React.FC<MapContainerProps>;
  }
  