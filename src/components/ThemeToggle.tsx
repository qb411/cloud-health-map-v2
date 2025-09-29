import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const buttonStyle = {
    padding: '8px',
    borderRadius: '8px',
    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
    color: theme === 'dark' ? '#f3f4f6' : '#4b5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: theme === 'dark' 
      ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const hoverStyle = {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      onMouseOver={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseOut={(e) => {
        Object.assign(e.currentTarget.style, buttonStyle);
      }}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;