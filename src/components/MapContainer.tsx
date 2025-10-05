import { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { MapContainerProps, ServiceStatus, CloudProvider } from '../types';
import { MAP_ZOOM_LEVELS, PROVIDER_COLORS } from '../types';
import { useMapState } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { ALL_REGIONS } from '../data/regions';
import { mockStatusService } from '../services/mockStatusService';
import MapEventHandler from './MapEventHandler';
import MapController from './MapController';
import ProviderIconMarker from './ProviderIconMarker';
import ProviderFilter from './ProviderFilter';

const MapContainer = ({ 
  regions, 
  selectedRegion, 
  onRegionClick,
  onMapClick 
}: MapContainerProps) => {
  const { mapState, updateMapCenter, updateMapZoom, selectRegion } = useMapState();
  const { theme } = useTheme();
  const [shouldReset, setShouldReset] = useState(false);
  const [regionStatuses, setRegionStatuses] = useState<Map<string, ServiceStatus>>(new Map());
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | 'all'>('aws'); // Start with AWS only

  // Load region statuses on mount
  useEffect(() => {
    const statuses = mockStatusService.getAllStatuses(ALL_REGIONS);
    setRegionStatuses(statuses);
  }, []);

  // Filter regions based on selected provider
  const filteredRegions = selectedProvider === 'all' 
    ? ALL_REGIONS 
    : ALL_REGIONS.filter(region => region.provider === selectedProvider);

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
    selectedProvider 
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
        whenCreated={(mapInstance) => {
          console.log('Leaflet map created:', mapInstance);
          // Force map to invalidate size after creation and on window resize
          const invalidateSize = () => {
            mapInstance.invalidateSize();
          };
          
          setTimeout(invalidateSize, 100);
          setTimeout(invalidateSize, 500);
          setTimeout(invalidateSize, 1000);
          
          // Add resize listener
          window.addEventListener('resize', invalidateSize);
          
          // Cleanup function would go here if this was a useEffect
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
      
      {/* Map controls overlay */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '8px',
        boxShadow: theme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        minWidth: '200px'
      }}>
        {/* Stats Section */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: theme === 'dark' ? '#d1d5db' : '#4b5563', 
            marginBottom: '4px' 
          }}>
            Regions: <span style={{ fontWeight: '500' }}>{filteredRegions.length}</span>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: theme === 'dark' ? '#9ca3af' : '#6b7280', 
            marginBottom: '4px' 
          }}>
            Zoom: <span style={{ fontWeight: '500' }}>{mapState.zoom}</span>
          </div>
        </div>

        {/* Provider Filter Section */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: theme === 'dark' ? '#f3f4f6' : '#374151',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Cloud Providers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { key: 'all' as const, label: 'All Providers' },
              { key: 'aws' as const, label: 'AWS', color: PROVIDER_COLORS.aws },
              { key: 'azure' as const, label: 'Azure', color: PROVIDER_COLORS.azure },
              { key: 'gcp' as const, label: 'GCP', color: PROVIDER_COLORS.gcp },
              { key: 'oci' as const, label: 'OCI', color: PROVIDER_COLORS.oci },
            ].map((provider) => (
              <button
                key={provider.key}
                onClick={() => setSelectedProvider(provider.key)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${
                    selectedProvider === provider.key 
                      ? (provider.color || '#3b82f6')
                      : (theme === 'dark' ? '#374151' : '#e5e7eb')
                  }`,
                  backgroundColor: selectedProvider === provider.key 
                    ? (provider.color || '#3b82f6')
                    : (theme === 'dark' ? '#1f2937' : 'white'),
                  color: selectedProvider === provider.key 
                    ? 'white' 
                    : (theme === 'dark' ? '#d1d5db' : '#374151'),
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  if (selectedProvider !== provider.key) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedProvider !== provider.key) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : 'white';
                  }
                }}
              >
                {provider.color && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: provider.color,
                    border: selectedProvider === provider.key ? '1px solid white' : 'none'
                  }} />
                )}
                {provider.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetView}
          style={{
            fontSize: '12px',
            backgroundColor: theme === 'dark' ? '#1e40af' : '#eff6ff',
            color: theme === 'dark' ? '#dbeafe' : '#2563eb',
            padding: '6px 12px',
            borderRadius: '4px',
            border: `1px solid ${theme === 'dark' ? '#3b82f6' : '#bfdbfe'}`,
            cursor: 'pointer',
            marginBottom: '8px',
            width: '100%',
            transition: 'background-color 0.2s',
            fontWeight: '500'
          }}
          title="Reset map to default view"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2563eb' : '#dbeafe'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e40af' : '#eff6ff'}
        >
          Reset View
        </button>

        {/* Selected Region */}
        {selectedRegion && (
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: theme === 'dark' ? '#60a5fa' : '#2563eb',
            borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            paddingTop: '8px'
          }}>
            Selected: {selectedRegion.name}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default MapContainer;