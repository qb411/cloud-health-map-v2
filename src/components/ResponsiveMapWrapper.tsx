import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '../types';

interface ResponsiveMapWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveMapWrapper = ({ children }: ResponsiveMapWrapperProps) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'tv'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      if (width >= BREAKPOINTS.tv) {
        setScreenSize('tv');
      } else if (width >= BREAKPOINTS.xl) {
        setScreenSize('desktop');
      } else if (width >= BREAKPOINTS.md) {
        setScreenSize('tablet');
      } else {
        setScreenSize('mobile');
      }
    };

    // Set initial screen size
    updateScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);



  const getResponsiveStyles = () => {
    const baseStyles = { width: '100%', height: '100%' };
    
    switch (screenSize) {
      case 'tv':
        return { ...baseStyles, fontSize: '24px' }; // Larger text for TV displays
      case 'desktop':
        return { ...baseStyles, fontSize: '16px' };
      case 'tablet':
        return { ...baseStyles, fontSize: '14px' };
      case 'mobile':
        return { ...baseStyles, fontSize: '12px' };
      default:
        return baseStyles;
    }
  };

  return (
    <div 
      style={getResponsiveStyles()}
      data-screen-size={screenSize}
    >
      {children}
    </div>
  );
};

export default ResponsiveMapWrapper;