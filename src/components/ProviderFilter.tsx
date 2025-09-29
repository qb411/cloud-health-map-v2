import { CloudProvider } from '../types';
import { PROVIDER_COLORS } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ProviderFilterProps {
  selectedProvider: CloudProvider | 'all';
  onProviderChange: (provider: CloudProvider | 'all') => void;
}

const ProviderFilter = ({ selectedProvider, onProviderChange }: ProviderFilterProps) => {
  const { theme } = useTheme();
  
  const providers: Array<{ 
    key: CloudProvider | 'all', 
    label: string, 
    color?: string,
    fullName?: string 
  }> = [
    { key: 'all', label: 'All Providers', fullName: 'All Cloud Providers' },
    { key: 'aws', label: 'AWS', color: PROVIDER_COLORS.aws, fullName: 'Amazon Web Services' },
    { key: 'azure', label: 'Azure', color: PROVIDER_COLORS.azure, fullName: 'Microsoft Azure' },
    { key: 'gcp', label: 'GCP', color: PROVIDER_COLORS.gcp, fullName: 'Google Cloud Platform' },
    { key: 'oci', label: 'OCI', color: PROVIDER_COLORS.oci, fullName: 'Oracle Cloud Infrastructure' },
  ];

  const getButtonStyle = (provider: CloudProvider | 'all', isSelected: boolean) => ({
    padding: '6px 12px',
    margin: '0 4px 4px 0',
    borderRadius: '6px',
    border: `1px solid ${
      isSelected 
        ? (provider !== 'all' ? PROVIDER_COLORS[provider as CloudProvider] : '#3b82f6')
        : (theme === 'dark' ? '#374151' : '#e5e7eb')
    }`,
    backgroundColor: isSelected 
      ? (provider !== 'all' ? PROVIDER_COLORS[provider as CloudProvider] : '#3b82f6')
      : (theme === 'dark' ? '#1f2937' : 'white'),
    color: isSelected 
      ? 'white' 
      : (theme === 'dark' ? '#d1d5db' : '#374151'),
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      zIndex: 10,
      backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderRadius: '8px',
      boxShadow: theme === 'dark' 
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '12px',
      border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
      maxWidth: '200px'
    }}>
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
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {providers.map((provider) => (
          <button
            key={provider.key}
            onClick={() => onProviderChange(provider.key)}
            style={getButtonStyle(provider.key, selectedProvider === provider.key)}
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
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                backgroundColor: provider.color,
                border: selectedProvider === provider.key ? '1px solid white' : 'none'
              }} />
            )}
            <span title={provider.fullName}>
              {provider.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProviderFilter;