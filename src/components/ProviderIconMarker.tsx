import { DivIcon } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { CloudRegion, ServiceStatus } from '../types';
import { STATUS_COLORS, PROVIDER_COLORS } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ProviderIconMarkerProps {
  region: CloudRegion;
  status: ServiceStatus;
  onClick: (region: CloudRegion) => void;
}

const ProviderIconMarker = ({ region, status, onClick }: ProviderIconMarkerProps) => {
  const { theme } = useTheme();
  
  const statusColor = STATUS_COLORS[status];
  const providerColor = PROVIDER_COLORS[region.provider];
  
  const handleClick = () => {
    onClick(region);
  };

  // Get provider icon/text
  const getProviderIcon = () => {
    switch (region.provider) {
      case 'aws':
        return 'AWS';
      case 'azure':
        return 'MS';  // Microsoft - avoids confusion with AWS Availability Zones
      case 'gcp':
        return 'GCP';
      case 'oci':
        return 'OCI';
      default:
        return '?';
    }
  };

  // Create custom DivIcon with provider text and status background
  const createCustomIcon = () => {
    const iconText = getProviderIcon();
    const size = 32;
    
    return new DivIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${statusColor};
          border: 2px solid ${providerColor};
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${iconText.length > 2 ? '8px' : '10px'};
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)';"
        >
          ${iconText}
        </div>
      `,
      className: 'custom-provider-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <Marker
      position={[region.coordinates.latitude, region.coordinates.longitude]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -20]}
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
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              backgroundColor: providerColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: '700',
              color: 'white'
            }}>
              {getProviderIcon()}
            </div>
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
    </Marker>
  );
};

export default ProviderIconMarker;