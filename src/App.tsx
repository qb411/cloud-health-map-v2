import { useState, useEffect } from 'react';
import { MapContainer } from './components';
import { CloudRegion } from './types';
import { useKeyboardNavigation } from './hooks';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
// import AdBanner from './components/AdBanner'; // Commented out - will activate later
import SupabaseConnectionTest from './components/SupabaseConnectionTest';
import RegionDetailPanel from './components/RegionDetailPanel';
import { autoCleanupIfNeeded } from './utils/databaseCleanup';

const Dashboard = () => {
  const { theme } = useTheme();
  // Use actual region data
  const [regions] = useState<CloudRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<CloudRegion | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Run automatic database cleanup if needed (once per day)
  useEffect(() => {
    autoCleanupIfNeeded().catch(error => {
      console.error('Auto cleanup failed:', error);
    });
  }, []);

  const handleRegionClick = (region: CloudRegion) => {
    setSelectedRegion(region);
    setIsPanelOpen(true);
  };

  const handleMapClick = () => {
    setSelectedRegion(undefined);
    setIsPanelOpen(false);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedRegion(undefined);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Enable keyboard navigation
  useKeyboardNavigation({
    onEscape: handleMapClick,
    onFullscreen: handleFullscreen,
    onRefresh: handleRefresh,
    enabled: true,
  });

  const getThemeStyles = () => ({
    background: theme === 'dark' ? '#111827' : '#f9fafb',
    headerBg: theme === 'dark' ? '#1f2937' : 'white',
    headerBorder: theme === 'dark' ? '#374151' : '#e5e7eb',
    headerShadow: theme === 'dark' 
      ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    titleColor: theme === 'dark' ? '#f9fafb' : '#111827',
    textColor: theme === 'dark' ? '#d1d5db' : '#6b7280',
    subtextColor: theme === 'dark' ? '#9ca3af' : '#4b5563',
  });

  const styles = getThemeStyles();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: styles.background,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ 
        backgroundColor: styles.headerBg, 
        boxShadow: styles.headerShadow, 
        borderBottom: `1px solid ${styles.headerBorder}`,
        flexShrink: 0
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(200, 200, 200, 0.4)',
              borderRadius: '6px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'calc(63px + 4px - 5px)',
              height: 'calc(63px + 4px - 5px)',
              overflow: 'hidden'
            }}>
              <img 
                src="./logo.png" 
                alt="Cloud Health Map Logo" 
                style={{ 
                  height: '63px', 
                  width: 'auto' 
                }} 
              />
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: styles.titleColor,
              margin: 0
            }}>
              Cloud Health Map
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '14px', color: styles.textColor }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ fontSize: '14px', color: styles.subtextColor }}>Live</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main style={{ 
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 73px)', // Subtract header height
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0, // Full height - no ad banner space reserved
          width: '100%',
          height: '100%'
        }}>
          <MapContainer
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
            onMapClick={handleMapClick}
          />
        </div>
        
        {/* Advertisement Banner - Commented out for now, will activate later */}
        {/* 
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '90px'
        }}>
          <AdBanner height={90} />
        </div>
        */}
      </main>
      
      {/* Temporary Supabase Connection Test */}
      <SupabaseConnectionTest />

      {/* Region Detail Panel */}
      <RegionDetailPanel
        region={selectedRegion || null}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        isDarkMode={theme === 'dark'}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App