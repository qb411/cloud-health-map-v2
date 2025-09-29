import { CircleMarker, Tooltip } from 'react-leaflet';
import { CloudRegion, ServiceStatus } from '../types';
import { STATUS_COLORS, PROVIDER_COLORS } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface RegionMarkerProps {
  region: CloudRegion;
  status: ServiceStatus;
  onClick: (region: CloudRegion) => void;
}

const RegionMarker = ({ region, status, onClick }: RegionMarkerProps) => {
  const { theme } = useTheme();
  
  const statusColor = STATUS_COLORS[status];
  const providerColor = PROVIDER_COLORS[region.provider];
  
  const handleClick = () => {
    onClick(region);
  };

  // Enhanced marker style with provider-specific styling
  const getMarkerStyle = () => {
    const baseStyle = {
      fillColor: statusColor,
      fillOpacity: 0.9,
      color: providerColor,
      weight: 3,
      opacity: 1,
    };

    // Add provider-specific styling enhancements
    switch (region.provider) {
      case 'aws':
        return {
          ...baseStyle,
          dashArray: '0', // Solid border for AWS
        };
      case 'azure':
        return {
          ...baseStyle,
          dashArray: '5,5', // Dashed border for Azure
        };
      case 'gcp':
        return {
          ...baseStyle,
          dashArray: '2,4', // Dotted border for GCP
        };
      case 'oci':
        return {
          ...baseStyle,
          dashArray: '8,2,2,2', // Dash-dot pattern for OCI
        };
      default:
        return baseStyle;
    }
  };

  const markerStyle = getMarkerStyle();

  const hoverStyle = {
    fillOpacity: 1.0,
    weight: 4,
    radius: 12,
  };

  const defaultRadius = 9;

  return (
    <CircleMarker
      center={[region.coordinates.latitude, region.coordinates.longitude]}
      radius={defaultRadius}
      pathOptions={markerStyle}
      eventHandlers={{
        click: handleClick,
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle(hoverStyle);
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle({ ...markerStyle, radius: defaultRadius });
        },
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -10]}
        permanent={false}
        sticky={false}
      >
        <div style={{ 
          padding: '8px 12px',
          backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
          color: theme === 'dark' ? '#f3f4f6' : '#111827',
          border: `2px solid ${providerColor}`,
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          boxShadow: theme === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          minWidth: '140px',
          position: 'relative'
        }}>
          {/* Provider color accent bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: providerColor,
            borderRadius: '6px 6px 0 0'
          }} />
          
          <div style={{ 
            marginBottom: '6px', 
            fontWeight: '600',
            paddingTop: '2px'
          }}>
            {region.name}
          </div>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: providerColor
            }} />
            <span style={{ 
              fontSize: '10px', 
              color: providerColor,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              {region.provider}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusColor
            }} />
            <span style={{
              fontSize: '11px',
              color: statusColor,
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {status}
            </span>
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
};

export default RegionMarker;