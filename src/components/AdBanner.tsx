import { useTheme } from '../contexts/ThemeContext';

interface AdBannerProps {
  height?: number;
  className?: string;
}

const AdBanner = ({ height = 90, className = '' }: AdBannerProps) => {
  const { theme } = useTheme();

  const getThemeStyles = () => ({
    background: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: theme === 'dark' ? '#374151' : '#e5e7eb',
    textColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
    placeholderBg: theme === 'dark' ? '#374151' : '#f3f4f6',
  });

  const styles = getThemeStyles();

  return (
    <div 
      className={className}
      style={{
        height: `${height}px`,
        backgroundColor: styles.background,
        borderTop: `1px solid ${styles.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        boxShadow: theme === 'dark' 
          ? '0 -1px 3px 0 rgba(0, 0, 0, 0.3)' 
          : '0 -1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Placeholder for future ad integration */}
      <div style={{
        width: '100%',
        maxWidth: '728px', // Standard leaderboard ad size
        height: `${height - 16}px`,
        backgroundColor: styles.placeholderBg,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px dashed ${styles.border}`,
        position: 'relative'
      }}>
        <div style={{
          textAlign: 'center',
          color: styles.textColor,
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <div style={{ marginBottom: '4px' }}>
            📢 Advertisement Space
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
            728x{height - 16} • Ready for integration
          </div>
        </div>
        
        {/* Corner label for development */}
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          fontSize: '8px',
          color: styles.textColor,
          opacity: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Ad Banner
        </div>
      </div>
    </div>
  );
};

export default AdBanner;