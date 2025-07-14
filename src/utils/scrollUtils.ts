// Utility functions for scroll behavior

export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

export const scrollToElement = (elementId: string, behavior: ScrollBehavior = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior });
  }
};

// Hook to automatically scroll to top when navigating to a new page
export const useScrollToTop = () => {
  return () => scrollToTop();
};

// Enhanced scroll to top with optional delay
export const scrollToTopWithDelay = (delay: number = 0, behavior: ScrollBehavior = 'smooth') => {
  setTimeout(() => {
    scrollToTop(behavior);
  }, delay);
};

// Scroll to top on route change
export const scrollToTopOnNavigation = () => {
  // Small delay to ensure DOM is updated
  requestAnimationFrame(() => {
    scrollToTop('smooth');
  });
};
