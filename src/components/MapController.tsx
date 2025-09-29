import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
  shouldReset: boolean;
  onResetComplete: () => void;
}

const MapController = ({ center, zoom, shouldReset, onResetComplete }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (shouldReset) {
      // Animate to the new position and zoom
      map.setView(center, zoom, {
        animate: true,
        duration: 1.0
      });
      onResetComplete();
    }
  }, [shouldReset, center, zoom, map, onResetComplete]);

  return null; // This component doesn't render anything
};

export default MapController;