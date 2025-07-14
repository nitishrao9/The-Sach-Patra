// Back/Forward Cache optimization utilities

// Ensure proper cleanup to prevent BFCache blocking
export const enableBFCache = () => {
  // Avoid using beforeunload and unload events which block BFCache
  // Instead use pagehide event for cleanup
  
  const handlePageHide = (event: PageTransitionEvent) => {
    // Only run cleanup if the page is being cached (persisted = true)
    if (event.persisted) {
      // Clean up any ongoing operations
      cleanupOngoingOperations();
    }
  };

  const handlePageShow = (event: PageTransitionEvent) => {
    // Restore functionality when page is restored from cache
    if (event.persisted) {
      // Reinitialize any necessary components
      reinitializeAfterBFCache();
    }
  };

  // Use pagehide instead of beforeunload/unload
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('pageshow', handlePageShow);

  // Return cleanup function
  return () => {
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('pageshow', handlePageShow);
  };
};

// Clean up ongoing operations that might block BFCache
const cleanupOngoingOperations = () => {
  // Clear any active timers
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }

  // Clear any active intervals
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }

  // Cancel any ongoing fetch requests
  if (window.AbortController) {
    // This would be handled by individual components with AbortController
    console.log('BFCache: Cleaned up ongoing operations');
  }
};

// Reinitialize components after BFCache restoration
const reinitializeAfterBFCache = () => {
  // Trigger any necessary re-initialization
  // This could include refreshing data, restarting timers, etc.
  console.log('BFCache: Page restored from cache, reinitializing...');
  
  // Dispatch a custom event that components can listen to
  window.dispatchEvent(new CustomEvent('bfcache-restore'));
};

// Hook for React components to handle BFCache events
export const useBFCacheOptimization = () => {
  const handleBFCacheRestore = () => {
    // Component-specific restoration logic
    console.log('Component restored from BFCache');
  };

  // Set up event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('bfcache-restore', handleBFCacheRestore);
    
    return () => {
      window.removeEventListener('bfcache-restore', handleBFCacheRestore);
    };
  }

  return () => {};
};

// Initialize BFCache optimization
if (typeof window !== 'undefined') {
  enableBFCache();
}
