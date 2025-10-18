import { useEffect, useState } from 'react';
import { CloudRegion } from '../types';
import { SupabaseService, CloudStatus, RegionStatusCurrent, RssProcessingError } from '../lib/supabase';


interface RegionDetailPanelProps {
  region: CloudRegion | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function RegionDetailPanel({ region, isOpen, onClose, isDarkMode }: RegionDetailPanelProps) {
  const [details, setDetails] = useState<RegionStatusCurrent | null>(null);
  const [incidents, setIncidents] = useState<CloudStatus[]>([]);
  const [errors, setErrors] = useState<RssProcessingError[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (region && isOpen) {
      fetchRegionData();
    }
  }, [region, isOpen]);

  const fetchRegionData = async () => {
    if (!region) return;

    setLoading(true);
    try {
      // Fetch region details
      const regionDetails = await SupabaseService.getRegionDetails(region.provider, region.id);
      setDetails(regionDetails);

      // Fetch active incidents for this region
      const regionIncidents = await SupabaseService.getRegionIncidents(region.provider, region.id);
      setIncidents(regionIncidents);

      // Fetch processing errors for this provider
      const processingErrors = await SupabaseService.getUnresolvedProcessingErrors(region.provider);
      setErrors(processingErrors);
    } catch (error) {
      console.error('Error fetching region data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!region) return null;

  const statusColor = {
    operational: 'text-green-500',
    degraded: 'text-amber-500',
    outage: 'text-red-500',
    maintenance: 'text-blue-500'
  };

  const severityColor = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const errorSeverityColor = {
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };

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
          backgroundColor: 'black',
          opacity: isOpen ? 0.5 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms',
          zIndex: 9998
        }}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: window.innerWidth < 640 ? '100%' : '500px',
          backgroundColor: isDarkMode ? '#0a0e1a' : '#f8f9fb',
          color: isDarkMode ? '#ffffff' : '#1a1d29',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff'
          }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                    color: isDarkMode ? '#93c5fd' : '#1e40af'
                  }}>
                    {region.provider.toUpperCase()}
                  </span>
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  lineHeight: '1.3',
                  marginBottom: '6px',
                  color: isDarkMode ? '#f9fafb' : '#111827'
                }}>
                  {region.name}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  fontFamily: 'monospace'
                }}>
                  {region.id}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#f3f4f6';
                  e.currentTarget.style.color = isDarkMode ? '#f9fafb' : '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = isDarkMode ? '#9ca3af' : '#6b7280';
                }}
                aria-label="Close panel"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px',
            backgroundColor: isDarkMode ? '#0a0e1a' : '#f8f9fb'
          }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid',
                  borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* No Data Message */}
                {!details && (
                  <div style={{
                    padding: '48px 24px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}>No Data Available</h3>
                    <p style={{
                      fontSize: '14px',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      This region doesn't have status data yet.
                      <br />
                      Data will appear here when incidents occur.
                    </p>
                  </div>
                )}

                {/* Overall Status Summary */}
                {details && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className="text-lg font-semibold mb-3">Region Status</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`font-semibold ${statusColor[details.overall_status]}`}>
                        {details.overall_status.toUpperCase()}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last updated: {new Date(details.last_updated).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-green-500">{details.operational_services}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operational</div>
                      </div>
                      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-amber-500">{details.degraded_services}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Degraded</div>
                      </div>
                      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-red-500">{details.outage_services}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Outage</div>
                      </div>
                      <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="text-2xl font-bold text-blue-500">{details.maintenance_services}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Maintenance</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Incidents */}
                <div>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    color: isDarkMode ? '#f9fafb' : '#111827',
                    letterSpacing: '-0.01em'
                  }}>
                    Active Incidents
                    {incidents.length > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '13px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontWeight: '500'
                      }}>
                        ({incidents.length})
                      </span>
                    )}
                  </h3>
                  {incidents.length === 0 ? (
                    <div style={{
                      padding: '32px 20px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 12px',
                        borderRadius: '50%',
                        backgroundColor: isDarkMode ? '#065f46' : '#d1fae5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>✓</div>
                      <span style={{
                        fontSize: '14px',
                        color: isDarkMode ? '#10b981' : '#059669',
                        fontWeight: '500'
                      }}>All systems operational</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {incidents.map((incident) => (
                        <div key={incident.id} style={{
                          padding: '20px',
                          borderRadius: '12px',
                          backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`,
                          transition: 'all 150ms'
                        }}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              lineHeight: '1.5',
                              color: isDarkMode ? '#f9fafb' : '#111827'
                            }}>{incident.incident_title || 'Untitled Incident'}</h4>
                            {incident.incident_severity && (
                              <span className={`text-xs px-2 py-1 rounded font-medium ${severityColor[incident.incident_severity]}`}>
                                {incident.incident_severity}
                              </span>
                            )}
                          </div>
                          {incident.incident_description && (
                            <p style={{
                              fontSize: '14px',
                              lineHeight: '1.6',
                              marginBottom: '12px',
                              color: isDarkMode ? '#d1d5db' : '#4b5563'
                            }}>
                              {incident.incident_description}
                            </p>
                          )}
                          {incident.service_name && (
                            <div style={{
                              fontSize: '13px',
                              marginBottom: '8px',
                              color: isDarkMode ? '#9ca3af' : '#6b7280'
                            }}>
                              Service: <span style={{ fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#374151' }}>{incident.service_name}</span>
                            </div>
                          )}
                          {incident.affected_services && incident.affected_services.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {incident.affected_services.map((service, idx) => (
                                <span key={idx} style={{
                                  fontSize: '12px',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                                  color: isDarkMode ? '#d1d5db' : '#374151'
                                }}>
                                  {service}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{
                            fontSize: '12px',
                            color: isDarkMode ? '#6b7280' : '#9ca3af',
                            marginTop: '8px'
                          }}>
                            Started: {incident.start_time ? new Date(incident.start_time).toLocaleString() : 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RSS Processing Errors */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Processing Errors ({errors.length})</h3>
                  {errors.length === 0 ? (
                    <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No processing errors</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {errors.map((error) => (
                        <div key={error.id} className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${errorSeverityColor[error.error_severity]}`}>
                                {error.error_severity}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {error.error_stage}
                              </span>
                            </div>
                            {!error.resolved_at && (
                              <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Unresolved
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {error.error_message}
                          </p>
                          {error.feed_url && (
                            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} break-all`}>
                              Feed: {error.feed_url}
                            </p>
                          )}
                          {error.http_status_code && (
                            <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              HTTP Status: {error.http_status_code}
                            </p>
                          )}
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Occurred: {new Date(error.occurred_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
