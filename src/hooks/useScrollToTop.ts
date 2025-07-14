import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTopOnNavigation } from '@/utils/scrollUtils';

// Hook to automatically scroll to top when route changes
export const useScrollToTopOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    scrollToTopOnNavigation();
  }, [location.pathname]);
};

// Hook for manual scroll to top with smooth animation
export const useScrollToTop = () => {
  return () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
};
