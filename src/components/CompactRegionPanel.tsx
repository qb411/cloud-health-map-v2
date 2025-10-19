import { useEffect, useState } from 'react';
import { CloudRegion } from '../types';
import { PROVIDER_COLORS } from '../types';
import { SupabaseService, CloudStatus, RegionStatusCurrent } from '../lib/supabase';

interface CompactRegionPanelProps {
  region: CloudRegion | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function CompactRegionPanel({ region, isOpen, onClose, isDarkMode }: CompactRegionPanelProps) {
  try {
    const [details, setDetails] = useState<RegionStatusCurrent | null>(null);
    const [incidents, setIncidents] = useState<CloudStatus[]>([]);
    const [loading, setLoading] = useState(false);

    console.log('CompactRegionPanel render:', { region, isOpen, isDarkMode });

    // Early return if not open or no region
    if (!isOpen || !region) {
      return null;
    }

    useEffect(() => {
      if (region && isOpen) {
        try {
          fetchRegionData();
        } catch (error) {
          console.error('Error in useEffect:', error);
        }
      }
    }, [region, isOpen]);

    const fetchRegionData = async () => {
      if (!region) return;

      setLoading(true);
      try {
        const regionDetails = await SupabaseService.getRegionDetails(region.provider, region.id);
        setDetails(regionDetails);

        const regionIncidents = await SupabaseService.getRegionIncidents(region.provider, region.id);
        setIncidents(regionIncidents);
      } catch (error) {
        console.error('Error fetching region data:', error);
        // Set empty data on error to prevent crashes
        setDetails(null);
        setIncidents([]);
      } finally {
        setLoading(false);
      }
    };

    if (!region) return null;

    const statusColor = {
      operational: '#10b981',
      degraded: '#f59e0b',
      outage: '#ef4444',
      maintenance: '#3b82f6'
    };

    // Use the exact same colors as the map markers
    const providerColors = PROVIDER_COLORS;

    // Fixed width that doesn't change on resize - set once when panel opens
    const [fixedPanelWidth] = useState(() => {
      try {
        const currentWidth = window.innerWidth;
        return currentWidth < 640 ? '300px' :
          currentWidth < 1024 ? '320px' : '360px';
      } catch (error) {
        console.error('Error calculating panel width:', error);
        return '360px'; // fallback
      }
    });

    return (
      <>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'opacity 250ms ease-out',
            zIndex: 9998
          }}
          onClick={onClose}
        />

        {/* Compact Side Panel */}
        <div
          style={{
            position: 'fixed',
            top: '180px', // Moved down 100px to not cover filter button
            right: '16px',
            width: fixedPanelWidth,
            maxHeight: 'calc(100vh - 200px)', // Adjusted for new position
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            zIndex: 9999,
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            overflow: 'hidden'
          }}
        >
          {/* Compact Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            position: 'relative'
          }}>
            {/* Close button - positioned absolutely in top-right */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 150ms',
                zIndex: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header content - single line spacing */}
            <div style={{ paddingRight: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: providerColors[region.provider as keyof typeof providerColors] || '#6b7280',
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  {region.provider.toUpperCase()}
                </span>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  lineHeight: '1',
                  margin: 0,
                  color: isDarkMode ? '#f9fafb' : '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {region.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Status Overview - moved up to separator line */}
          <div style={{
            padding: '12px 16px 0',
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              margin: 0,
              marginBottom: '8px',
              color: isDarkMode ? '#f9fafb' : '#111827',
              lineHeight: '1'
            }}>
              Status Overview
            </h4>
          </div>

          {/* Compact Content */}
          <div style={{
            maxHeight: 'calc(80vh - 120px)',
            overflowY: 'auto',
            padding: '0 16px 16px'
          }}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {/* No Data Message */}
                {!details && (
                  <div style={{
                    padding: '16px 12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px', opacity: 0.5 }}>📊</div>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '2px',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      lineHeight: '1'
                    }}>No Data Available</h4>
                    <p style={{
                      fontSize: '11px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      lineHeight: '1.2',
                      margin: 0
                    }}>
                      Status data will appear when incidents occur.
                    </p>
                  </div>
                )}

                {/* Simple Status Header */}
                {details && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: statusColor[details.overall_status],
                      lineHeight: '1'
                    }}>
                      {details.overall_status.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      lineHeight: '1'
                    }}>
                      {new Date(details.last_updated).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Compact Active Incidents */}
                {incidents.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '6px',
                      color: isDarkMode ? '#f9fafb' : '#111827',
                      lineHeight: '1'
                    }}>
                      Active Incidents ({incidents.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {incidents.slice(0, 4).map((incident, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                            border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: statusColor[incident.status as keyof typeof statusColor] || '#6b7280',
                            lineHeight: '1',
                            minWidth: '60px'
                          }}>
                            {incident.status?.toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            color: isDarkMode ? '#d1d5db' : '#374151',
                            lineHeight: '1',
                            flex: 1,
                            textAlign: 'right'
                          }}>
                            {incident.service_name || 'Service incident'}
                          </span>
                        </div>
                      ))}
                      {incidents.length > 4 && (
                        <div style={{
                          padding: '4px',
                          textAlign: 'center',
                          fontSize: '10px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          lineHeight: '1'
                        }}>
                          +{incidents.length - 4} more incidents
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in CompactRegionPanel:', error);
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999
      }}>
        <p>Error loading region details</p>
        <button onClick={onClose} style={{ marginTop: '10px', padding: '5px 10px' }}>
          Close
        </button>
      </div>
    );
  }
}