import { useState, useEffect } from 'react';
import { SupabaseService, RegionStatusCurrent } from '../lib/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [sampleData, setSampleData] = useState<RegionStatusCurrent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);

      // Test basic connection
      const isConnected = await SupabaseService.testConnection();
      
      if (!isConnected) {
        throw new Error('Failed to connect to Supabase');
      }

      // Try to fetch sample data
      const data = await SupabaseService.getCurrentRegionStatus();
      setSampleData(data);
      setConnectionStatus('connected');
      
      console.log('✅ Supabase connection successful!');
      console.log('📊 Sample data:', data);
      
    } catch (err) {
      console.error('❌ Supabase connection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnectionStatus('error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#10b981'; // green
      case 'degraded': return '#f59e0b'; // yellow/orange
      case 'outage': return '#ef4444'; // red
      case 'maintenance': return '#6366f1'; // blue
      default: return '#6b7280'; // gray
    }
  };

  // Collapsed view - just a small status indicator
  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: '110px', // Above the ad banner
          left: '20px',
          width: '40px',
          height: '40px',
          backgroundColor: connectionStatus === 'connected' ? '#3ECF8E' : 
                          connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title={`Supabase: ${connectionStatus === 'connected' ? 'Connected' : 
                           connectionStatus === 'error' ? 'Error' : 'Testing'} - Click to expand`}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Supabase logo SVG */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 109 113" 
          fill="white"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
        >
          {/* Supabase logo paths */}
          <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="white"/>
          <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)" fillOpacity="0.2"/>
          <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="white"/>
          <defs>
            <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0"/>
              <stop offset="1" stopColor="white" stopOpacity="0.24"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Expanded view - full panel
  return (
    <div style={{
      position: 'fixed',
      bottom: '110px', // Above the ad banner
      left: '20px',
      width: '300px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      fontSize: '14px'
    }}>
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
            backgroundColor: connectionStatus === 'connected' ? '#3ECF8E' : 
                            connectionStatus === 'error' ? '#ef4444' : '#f59e0b'
          }} />
          Supabase Connection Test
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#6b7280',
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

      {connectionStatus === 'testing' && (
        <div style={{ color: '#6b7280' }}>Testing connection...</div>
      )}

      {connectionStatus === 'error' && (
        <div>
          <div style={{ color: '#ef4444', marginBottom: '8px' }}>
            ❌ Connection Failed
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            backgroundColor: '#fef2f2',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
          <button
            onClick={testConnection}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div>
          <div style={{ color: '#10b981', marginBottom: '12px' }}>
            ✅ Connected Successfully!
          </div>
          
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>
            Sample Data ({sampleData.length} regions):
          </div>
          
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            fontSize: '12px'
          }}>
            {sampleData.map((region) => (
              <div 
                key={`${region.provider}-${region.region_id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {region.provider.toUpperCase()}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px' }}>
                    {region.region_name}
                  </div>
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(region.overall_status)
                }} />
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#f0fdf4',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#166534'
          }}>
            🎉 Database schema loaded successfully!<br/>
            Ready for RSS feed integration.
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionTest;