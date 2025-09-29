import { useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

interface MapEventHandlerProps {
  onMapMove?: (center: LatLngExpression, zoom: number) => void;
  onMapClick?: () => void;
  onZoomEnd?: (zoom: number) => void;
}

const MapEventHandler = ({ onMapMove, onMapClick, onZoomEnd }: MapEventHandlerProps) => {
  const map = useMapEvents({
    moveend: () => {
      if (onMapMove) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapMove([center.lat, center.lng], zoom);
      }
    },
    
    zoomend: () => {
      if (onZoomEnd) {
        const zoom = map.getZoom();
        onZoomEnd(zoom);
      }
    },
    
    click: () => {
      if (onMapClick) {
        onMapClick();
      }
    },
  });

  return null; // This component doesn't render anything
};

export default MapEventHandler;