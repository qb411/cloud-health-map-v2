import { Polygon, Tooltip } from 'react-leaflet';
import { RegionOverlayProps } from '../types';
import { PROVIDER_COLORS, STATUS_COLORS } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const RegionOverlay = ({ region, status, onClick }: RegionOverlayProps) => {
  const { theme } = useTheme();
  
  // Get colors based on status and provider
  const statusColor = STATUS_COLORS[status];
  const providerColor = PROVIDER_COLORS[region.provider];
  
  // Create polygon positions from GeoJSON coordinates
  const positions = region.boundaries.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
  
  const handleClick = () => {
    onClick(region);
  };

  // Style the polygon based on status
  const polygonStyle = {
    fillColor: statusColor,
    fillOpacity: 0.6,
    color: providerColor,
    weight: 2,
    opacity: 0.8,
  };

  const hoverStyle = {
    fillOpacity: 0.8,
    weight: 3,
  };

  return (
    <Polygon
      positions={positions}
      pathOptions={polygonStyle}
      eventHandlers={{
        click: handleClick,
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle(hoverStyle);
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle(polygonStyle);
        },
      }}
    >
      <Tooltip
        direction="center"
        permanent={false}
        sticky={true}
        className={theme === 'dark' ? 'dark-tooltip' : 'light-tooltip'}
      >
        <div style={{ 
          padding: '4px 8px',
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
          color: theme === 'dark' ? '#f3f4f6' : '#111827',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <div style={{ marginBottom: '2px' }}>
            {region.name}
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            textTransform: 'uppercase'
          }}>
            {region.provider} • {status}
          </div>
        </div>
      </Tooltip>
    </Polygon>
  );
};

export default RegionOverlay;