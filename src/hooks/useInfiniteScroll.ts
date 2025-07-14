import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '@/types';
import { newsService } from '@/services/firebaseService';
import { DocumentSnapshot } from 'firebase/firestore';

interface UseInfiniteScrollProps {
  category?: string;
  status?: 'published' | 'draft' | 'all';
  pageSize?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  articles: NewsArticle[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export const useInfiniteScroll = ({
  category,
  status = 'published',
  pageSize = 15,
  enabled = true
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [initialLoad, setInitialLoad] = useState(true);

  const loadArticles = useCallback(async (isLoadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await newsService.getNews(
        pageSize,
        isLoadMore ? lastDoc : undefined,
        category,
        status
      );

      if (isLoadMore) {
        setArticles(prev => [...prev, ...data.items]);
      } else {
        setArticles(data.items);
      }

      // Check if we have more data
      setHasMore(data.items.length === pageSize);
      
      // Update lastDoc for pagination
      if (data.items.length > 0) {
        // This would need to be implemented in the service to return the last document
        // For now, we'll use a simple approach
        setLastDoc(undefined); // Placeholder
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [category, status, pageSize, lastDoc, loading]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadArticles(true);
    }
  }, [loadArticles, loading, hasMore]);

  const refresh = useCallback(() => {
    setArticles([]);
    setLastDoc(undefined);
    setHasMore(true);
    setInitialLoad(true);
    loadArticles(false);
  }, [loadArticles]);

  // Initial load
  useEffect(() => {
    if (initialLoad && enabled) {
      loadArticles(false);
    }
  }, [loadArticles, initialLoad, enabled]);

  // Refresh when category or status changes
  useEffect(() => {
    refresh();
  }, [category, status]);

  return {
    articles,
    loading,
    hasMore,
    error,
    loadMore,
    refresh
  };
};

// Hook for infinite scroll with intersection observer
export const useInfiniteScrollObserver = (
  loadMore: () => void,
  hasMore: boolean,
  loading: boolean
) => {
  const [targetRef, setTargetRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!targetRef || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observer.observe(targetRef);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, loadMore, hasMore, loading]);

  return setTargetRef;
};
