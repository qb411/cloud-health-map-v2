import { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { MapContainerProps, ServiceStatus, CloudProvider } from '../types';
import { MAP_ZOOM_LEVELS } from '../types';
import { useMapState } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { ALL_REGIONS } from '../data/regions';
import { SupabaseService } from '../lib/supabase';
import MapEventHandler from './MapEventHandler';
import MapController from './MapController';
import ProviderIconMarker from './ProviderIconMarker';
import CollapsibleRegionSelector from './CollapsibleRegionSelector';
const MapContainer = ({ 
  selectedRegion, 
  onRegionClick,
  onMapClick 
}: MapContainerProps) => {
  const { mapState, updateMapCenter, updateMapZoom, selectRegion } = useMapState();
  const { theme } = useTheme();
  const [shouldReset, setShouldReset] = useState(false);
  const [regionStatuses, setRegionStatuses] = useState<Map<string, ServiceStatus>>(new Map());
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | 'all'>('all'); // Start with all providers
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set()); // Custom region selection
  const [selectionMode, setSelectionMode] = useState<'provider' | 'custom'>('provider'); // Selection mode

  // Load region statuses on mount
  useEffect(() => {
    const loadRegionStatuses = async () => {
      try {
        const supabaseData = await SupabaseService.getCurrentRegionStatus();
        const statusMap = new Map<string, ServiceStatus>();
        
        // Convert Supabase data to status map
        supabaseData.forEach(region => {
          statusMap.set(region.region_id, region.overall_status as ServiceStatus);
        });
        
        setRegionStatuses(statusMap);
        console.log('✅ Loaded real status data from Supabase:', supabaseData.length, 'regions');
      } catch (error) {
        console.error('❌ Failed to load Supabase data, using fallback:', error);
        // Fallback to operational status for all regions
        const fallbackStatuses = new Map<string, ServiceStatus>();
        ALL_REGIONS.forEach(region => {
          fallbackStatuses.set(region.id, 'operational');
        });
        setRegionStatuses(fallbackStatuses);
      }
    };
    
    loadRegionStatuses();
  }, []);

  // Filter regions based on selection mode
  const filteredRegions = selectionMode === 'custom'
    ? ALL_REGIONS.filter(region => selectedRegions.has(region.id))
    : (selectedProvider === 'all' 
        ? ALL_REGIONS 
        : ALL_REGIONS.filter(region => region.provider === selectedProvider));

  const handleMapMove = (center: LatLngExpression, zoom: number) => {
    // Convert LatLngExpression to [number, number] tuple
    const centerArray: [number, number] = Array.isArray(center) 
      ? [center[0], center[1]] 
      : [center.lat, center.lng];
    updateMapCenter(centerArray);
    updateMapZoom(zoom);
  };

  const handleMapClick = () => {
    selectRegion(undefined); // Deselect any selected region
    onMapClick();
  };

  const handleRegionClick = (region: any) => {
    selectRegion(region.id);
    onRegionClick(region);
  };

  const handleZoomEnd = (zoom: number) => {
    updateMapZoom(zoom);
  };

  const handleResetView = () => {
    updateMapCenter([30, 10]);
    updateMapZoom(3);
    setShouldReset(true);
  };

  const handleResetComplete = () => {
    setShouldReset(false);
  };

  // Debug logging
  console.log('MapContainer render:', { 
    filteredRegions: filteredRegions.length, 
    mapState, 
    selectedProvider,
    selectionMode,
    selectedRegionsCount: selectedRegions.size
  });

  return (
    <div 
      className="map-wrapper"
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <LeafletMapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        style={{ 
          width: '100%', 
          height: '100%', 
          flex: 1,
          minHeight: '500px',
          zIndex: 0, 
          borderRadius: '8px' 
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        minZoom={MAP_ZOOM_LEVELS.world}
        maxZoom={MAP_ZOOM_LEVELS.city}
        worldCopyJump={false}
        attributionControl={true}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        whenReady={() => {
          console.log('Leaflet map ready');
        }}
      >
        {/* Map event handlers */}
        <MapEventHandler
          onMapMove={handleMapMove}
          onMapClick={handleMapClick}
          onZoomEnd={handleZoomEnd}
        />

        {/* Map controller for programmatic control */}
        <MapController
          center={[30, 10]}
          zoom={3}
          shouldReset={shouldReset}
          onResetComplete={handleResetComplete}
        />

        {/* OpenStreetMap tile layer with noWrap to prevent repeating */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          noWrap={true}
        />
        
        {/* Cloud provider region markers */}
        {filteredRegions.map((region) => {
          const status = regionStatuses.get(region.id) || 'operational';
          return (
            <ProviderIconMarker
              key={region.id}
              region={region}
              status={status}
              onClick={handleRegionClick}
            />
          );
        })}
      </LeafletMapContainer>
      
      {/* Selected Region Display */}
      {selectedRegion && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          zIndex: 10,
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '12px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          fontSize: '12px',
          fontWeight: '500',
          color: theme === 'dark' ? '#60a5fa' : '#2563eb'
        }}>
          Selected: {selectedRegion.name}
        </div>
      )}

      {/* Full-screen toggle button */}
      <button
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }}
        title="Toggle fullscreen"
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : 'white'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
      >
        <svg style={{ 
          width: '20px', 
          height: '20px', 
          color: theme === 'dark' ? '#d1d5db' : '#4b5563' 
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {/* Collapsible Region Selector */}
      <CollapsibleRegionSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        selectedRegions={selectedRegions}
        onRegionsChange={setSelectedRegions}
        selectionMode={selectionMode}
        onModeChange={setSelectionMode}
        filteredRegionsCount={filteredRegions.length}
        currentZoom={mapState.zoom}
        onResetView={handleResetView}
      />
    </div>
  );
};

export default MapContainer;