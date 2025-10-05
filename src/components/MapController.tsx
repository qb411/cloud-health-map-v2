import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { LatLngBounds } from 'leaflet';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
  shouldReset: boolean;
  onResetComplete: () => void;
}

const MapController = ({ center, zoom, shouldReset, onResetComplete }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    // Set up map bounds to prevent infinite panning
    const worldBounds = new LatLngBounds(
      [-85, -180], // Southwest corner
      [85, 180]    // Northeast corner
    );
    
    map.setMaxBounds(worldBounds);
    map.options.maxBoundsViscosity = 1.0; // Prevent dragging outside bounds
    
    // Handle window resize events (including fullscreen changes)
    const handleResize = () => {
      setTimeout(() => {
        map.invalidateSize();
        // Ensure map stays within bounds after resize
        if (!worldBounds.contains(map.getCenter())) {
          map.panInsideBounds(worldBounds);
        }
      }, 100);
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    document.addEventListener('mozfullscreenchange', handleResize);
    document.addEventListener('MSFullscreenChange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
      document.removeEventListener('mozfullscreenchange', handleResize);
      document.removeEventListener('MSFullscreenChange', handleResize);
    };
  }, [map]);

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