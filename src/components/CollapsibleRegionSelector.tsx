import { useState } from 'react';
import { CloudProvider } from '../types';
import { PROVIDER_COLORS } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ALL_REGIONS } from '../data/regions';

interface CollapsibleRegionSelectorProps {
  selectedProvider: CloudProvider | 'all';
  onProviderChange: (provider: CloudProvider | 'all') => void;
  filteredRegionsCount: number;
  currentZoom: number;
  onResetView: () => void;
}

const CollapsibleRegionSelector = ({
  selectedProvider,
  onProviderChange,
  filteredRegionsCount,
  currentZoom,
  onResetView
}: CollapsibleRegionSelectorProps) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current selection status for display
  const getSelectionStatus = () => {
    if (selectedProvider === 'all') {
      return { text: 'All', color: '#3b82f6' };
    }
    const providerColors = {
      aws: PROVIDER_COLORS.aws,
      azure: PROVIDER_COLORS.azure,
      gcp: PROVIDER_COLORS.gcp,
      oci: PROVIDER_COLORS.oci
    };
    return { 
      text: selectedProvider.toUpperCase(), 
      color: providerColors[selectedProvider] || '#6b7280' 
    };
  };

  const status = getSelectionStatus();

  // Collapsed view - small circular indicator in top-right
  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          top: '120px',
          right: '20px',
          width: '50px',
          height: '50px',
          backgroundColor: status.color,
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
            : '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title={`Region Filter: ${status.text} (${filteredRegionsCount} regions) - Click to expand`}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Filter icon */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="white"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
        >
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>
    );
  }

  // Expanded view - full panel in top-right
  return (
    <div style={{
      position: 'fixed',
      top: '120px',
      right: '20px',
      width: '280px',
      backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      borderRadius: '8px',
      padding: '16px',
      boxShadow: theme === 'dark' 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      fontSize: '14px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontWeight: '600'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: status.color
          }} />
          <span style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}>
            Region Filter
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Collapse"
        >
          ×
        </button>
      </div>

      {/* Stats */}
      <div style={{ 
        marginBottom: '16px',
        fontSize: '12px',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280'
      }}>
        Showing {filteredRegionsCount} of {ALL_REGIONS.length} regions
      </div>

      {/* All Providers Button */}
      <button
        onClick={() => onProviderChange('all')}
        style={{
          padding: '6px 8px',
          borderRadius: '4px',
          border: `1px solid ${
            selectedProvider === 'all' 
              ? '#3b82f6'
              : (theme === 'dark' ? '#374151' : '#e5e7eb')
          }`,
          backgroundColor: selectedProvider === 'all' 
            ? '#3b82f6'
            : (theme === 'dark' ? '#1f2937' : 'white'),
          color: selectedProvider === 'all' 
            ? 'white' 
            : (theme === 'dark' ? '#d1d5db' : '#374151'),
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          width: '100%',
          marginBottom: '8px'
        }}
        onMouseOver={(e) => {
          if (selectedProvider !== 'all') {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
          }
        }}
        onMouseOut={(e) => {
          if (selectedProvider !== 'all') {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : 'white';
          }
        }}
      >
        All Providers
      </button>

      {/* Provider Grid (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {[
          { key: 'aws' as const, label: 'AWS', color: PROVIDER_COLORS.aws },
          { key: 'azure' as const, label: 'Azure', color: PROVIDER_COLORS.azure },
          { key: 'gcp' as const, label: 'GCP', color: PROVIDER_COLORS.gcp },
          { key: 'oci' as const, label: 'OCI', color: PROVIDER_COLORS.oci },
        ].map((provider) => {
          const isSelected = selectedProvider === provider.key;
          
          return (
            <button
              key={provider.key}
              onClick={() => onProviderChange(provider.key)}
              style={{
                padding: '4px 6px',
                borderRadius: '4px',
                border: `1px solid ${provider.color}`,
                backgroundColor: isSelected 
                  ? provider.color
                  : (theme === 'dark' ? '#1f2937' : 'white'),
                color: isSelected 
                  ? 'white' 
                  : provider.color,
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : 'white';
                }
              }}
            >
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '1px',
                backgroundColor: provider.color,
                border: isSelected ? '1px solid white' : 'none'
              }} />
              {provider.label}
            </button>
          );
        })}
      </div>

      {/* Stats and Controls */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
      }}>
        {/* Stats */}
        <div style={{ 
          marginBottom: '12px',
          fontSize: '12px',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }}>
          <div style={{ marginBottom: '4px' }}>
            Zoom: <span style={{ fontWeight: '500' }}>{currentZoom}</span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetView}
          style={{
            fontSize: '12px',
            backgroundColor: theme === 'dark' ? '#1e40af' : '#eff6ff',
            color: theme === 'dark' ? '#dbeafe' : '#2563eb',
            padding: '6px 12px',
            borderRadius: '4px',
            border: `1px solid ${theme === 'dark' ? '#3b82f6' : '#bfdbfe'}`,
            cursor: 'pointer',
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
      </div>
    </div>
  );
};

export default CollapsibleRegionSelector;