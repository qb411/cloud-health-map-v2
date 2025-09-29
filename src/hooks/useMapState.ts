import { useState, useCallback, useEffect } from 'react';
import { MapState, LOCAL_STORAGE_KEYS, DEFAULT_CONFIG } from '../types';

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>({
    center: DEFAULT_CONFIG.defaultMapCenter,
    zoom: DEFAULT_CONFIG.defaultMapZoom,
    selectedRegionId: undefined,
  });

  // Load map state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.MAP_STATE);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Validate the stored state has required properties
        if (parsedState.center && parsedState.zoom) {
          setMapState(parsedState);
        }
      }
    } catch (error) {
      console.warn('Failed to load map state from localStorage:', error);
    }
  }, []);

  // Save map state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.MAP_STATE,
        JSON.stringify({
          ...mapState,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to save map state to localStorage:', error);
    }
  }, [mapState]);

  const updateMapCenter = useCallback((center: [number, number]) => {
    setMapState(prev => ({ ...prev, center }));
  }, []);

  const updateMapZoom = useCallback((zoom: number) => {
    setMapState(prev => ({ ...prev, zoom }));
  }, []);

  const selectRegion = useCallback((regionId?: string | undefined) => {
    setMapState(prev => ({ ...prev, selectedRegionId: regionId }));
  }, []);

  const resetMapState = useCallback(() => {
    setMapState({
      center: DEFAULT_CONFIG.defaultMapCenter,
      zoom: DEFAULT_CONFIG.defaultMapZoom,
      selectedRegionId: undefined,
    });
  }, []);

  return {
    mapState,
    updateMapCenter,
    updateMapZoom,
    selectRegion,
    resetMapState,
  };
};