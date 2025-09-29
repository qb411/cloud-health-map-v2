import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onFullscreen?: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onFullscreen,
  onRefresh,
  enabled = true,
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          onEscape();
          event.preventDefault();
        }
        break;
      
      case 'F11':
        if (onFullscreen) {
          onFullscreen();
          event.preventDefault();
        }
        break;
      
      case 'r':
      case 'R':
        if ((event.ctrlKey || event.metaKey) && onRefresh) {
          onRefresh();
          event.preventDefault();
        }
        break;
      
      default:
        break;
    }
  }, [onEscape, onFullscreen, onRefresh, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [handleKeyDown, enabled]);
};