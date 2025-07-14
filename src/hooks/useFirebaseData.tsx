import { useState, useEffect } from 'react';
import { newsService, adService, userService, videoService, galleryService, breakingNewsService } from '@/services/firebaseService';
import { NewsArticle, Advertisement, User, PaginationData, Video, GalleryImage, BreakingNews } from '@/types';

// Hook for news data
export const useNews = (category?: string, status: 'published' | 'draft' | 'all' = 'published', state?: string) => {
  const [news, setNews] = useState<PaginationData<NewsArticle>>({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (pageSize: number = 20) => {
    try {
      setLoading(true);
      const data = await newsService.getNews(pageSize, undefined, category, status, state);
      setNews(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'समाचार लोड करने में त्रुटि');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category, status, state]);

  return { news, loading, error, refetch: fetchNews };
};

// Hook for single news article
export const useNewsArticle = (id: string) => {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await newsService.getNewsById(id);
        setArticle(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'लेख लोड करने में त्रुटि');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  return { article, loading, error };
};

// Hook for featured news
export const useFeaturedNews = () => {
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        setLoading(true);
        const data = await newsService.getFeaturedNews();
        setFeaturedNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'मुख्य समाचार लोड करने में त्रुटि');
        console.error('Error fetching featured news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  return { featuredNews, loading, error };
};

// Hook for news by categories (for home page tabs)
export const useNewsByCategories = () => {
  const [categorizedNews, setCategorizedNews] = useState<Record<string, NewsArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategorizedNews = async () => {
      try {
        setLoading(true);

        // Import custom categories service
        const { getCustomCategories } = await import('@/services/categoryService');

        // Get default categories (English for consistency)
        const defaultCategories = ['national', 'international', 'politics', 'sports', 'entertainment', 'technology', 'business', 'education', 'agriculture', 'special'];

        // Fetch custom categories
        const customCategories = await getCustomCategories();

        // Combine default and custom categories
        const allCategories = [...defaultCategories, ...customCategories];
        setCategories(allCategories);

        const newsData: Record<string, NewsArticle[]> = {};

        // Fetch news for each category sequentially to avoid rate limits
        for (const category of allCategories) {
          try {
            const data = await newsService.getNews(6, undefined, category, 'published');
            newsData[category] = data.items;
            // Small delay to avoid overwhelming Firestore
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (categoryError) {
            console.error(`Error fetching news for category ${category}:`, categoryError);
            newsData[category] = []; // Set empty array for failed categories
          }
        }

        setCategorizedNews(newsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'श्रेणीबद्ध समाचार लोड करने में त्रुटि');
        console.error('Error fetching categorized news:', err);
        // Set empty data on error
        const emptyData: Record<string, NewsArticle[]> = {};
        categories.forEach(cat => emptyData[cat] = []);
        setCategorizedNews(emptyData);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorizedNews();
  }, []);

  return { categorizedNews, loading, error, categories };
};

// Hook for trending tags
export const useTrendingTags = () => {
  const [trendingTags, setTrendingTags] = useState<Array<{name: string, count: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        setLoading(true);
        // Get recent published articles to analyze tags
        const data = await newsService.getNews(100, undefined, undefined, 'published');

        // Count tag frequency
        const tagCounts: Record<string, number> = {};
        data.items.forEach(article => {
          article.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        // Sort by frequency and take top 10
        const sortedTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTrendingTags(sortedTags);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ट्रेंडिंग टैग लोड करने में त्रुटि');
        console.error('Error fetching trending tags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTags();
  }, []);

  return { trendingTags, loading, error };
};

// Hook for most viewed articles
export const useMostViewedNews = (limit: number = 5) => {
  const [mostViewedNews, setMostViewedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostViewedNews = async () => {
      try {
        setLoading(true);
        const articles = await newsService.getMostViewedNews(limit);
        setMostViewedNews(articles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'सबसे लोकप्रिय समाचार लोड करने में त्रुटि');
        console.error('Error fetching most viewed news:', err);
        setMostViewedNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewedNews();
  }, [limit]);

  return { mostViewedNews, loading, error };
};

// Hook for videos
export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await videoService.getFeaturedVideos(6);
        setVideos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'वीडियो लोड करने में त्रुटि');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, loading, error };
};

// Hook for gallery images
export const useGalleryImages = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await galleryService.getFeaturedImages(6);
        setImages(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'गैलरी इमेज लोड करने में त्रुटि');
        console.error('Error fetching gallery images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return { images, loading, error };
};

// Hook for breaking news
export const useBreakingNews = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        const data = await breakingNewsService.getActiveBreakingNews();
        setBreakingNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ब्रेकिंग न्यूज़ लोड करने में त्रुटि');
        console.error('Error fetching breaking news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  return { breakingNews, loading, error };
};

// Hook for all breaking news (admin)
export const useAllBreakingNews = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakingNews = async () => {
    try {
      setLoading(true);
      const data = await breakingNewsService.getAllBreakingNews();
      setBreakingNews(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch breaking news');
      console.error('Error fetching breaking news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  return { breakingNews, loading, error, refetch: fetchBreakingNews };
};

// Hook for advertisements
export const useAds = (position: Advertisement['position'], category?: string) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        console.log(`Fetching ads for position: ${position}, category: ${category}`);
        const data = await adService.getAdsByPosition(position, category);
        console.log(`Raw ads from service: ${data.length}`, data);

        // Filter ads by date range
        const now = new Date();
        console.log('Current date:', now);
        console.log('Current date string:', now.toLocaleDateString());
        console.log('Current date ISO:', now.toISOString());

        const activeAds = data.filter(ad => {
          const isActive = ad.isActive;

          // Create date objects and normalize to avoid timezone issues
          const startDate = new Date(ad.startDate);
          const endDate = new Date(ad.endDate);
          const currentDate = new Date();

          // Set times to start/end of day for proper comparison
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

          // Allow ads that start within 2 days (for timezone flexibility and testing)
          const adjustedStartDate = new Date(startDate);
          adjustedStartDate.setDate(adjustedStartDate.getDate() - 2);

          const isInDateRange = currentDate >= adjustedStartDate && currentDate <= endDate;

          console.log(`Ad ${ad.id} (${ad.title}):
            - isActive: ${isActive}
            - position: ${ad.position}
            - startDate: ${startDate.toLocaleDateString()}
            - endDate: ${endDate.toLocaleDateString()}
            - currentDate: ${currentDate.toLocaleDateString()}
            - isInDateRange: ${isInDateRange}
            - passes filter: ${isActive && isInDateRange}`);

          return isActive && isInDateRange;
        });

        console.log(`Active ads after filtering: ${activeAds.length}`, activeAds);
        setAds(activeAds);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ads');
        console.error('Error fetching ads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position, category]);

  return { ads, loading, error };
};

// Hook for all advertisements (admin)
export const useAllAds = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const data = await adService.getAllAds();
      setAds(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ads');
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return { ads, loading, error, refetch: fetchAds };
};

// Hook for users (admin)
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

// Hook for CRUD operations
export const useFirebaseCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMessage);
      console.error('CRUD operation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // News operations
    createNews: (article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeOperation(() => newsService.createNews(article)),
    updateNews: (id: string, updates: Partial<NewsArticle>) =>
      executeOperation(() => newsService.updateNews(id, updates)),
    deleteNews: (id: string) =>
      executeOperation(() => newsService.deleteNews(id)),
    
    // Ad operations
    createAd: (ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'impressionCount'>) =>
      executeOperation(() => adService.createAd(ad)),
    updateAd: (id: string, updates: Partial<Advertisement>) =>
      executeOperation(() => adService.updateAd(id, updates)),
    deleteAd: (id: string) =>
      executeOperation(() => adService.deleteAd(id)),
    trackAdImpression: (id: string) =>
      executeOperation(() => adService.trackImpression(id)),
    trackAdClick: (id: string) =>
      executeOperation(() => adService.trackClick(id)),
    
    // User operations
    updateUserRole: (id: string, role: User['role']) =>
      executeOperation(() => userService.updateUserRole(id, role)),
    updateUser: (id: string, updates: Partial<User>) =>
      executeOperation(() => userService.updateUser(id, updates)),
    deleteUser: (id: string) =>
      executeOperation(() => userService.deleteUser(id)),

    // Video operations
    createVideo: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeOperation(() => videoService.createVideo(video)),
    updateVideo: (id: string, updates: Partial<Video>) =>
      executeOperation(() => videoService.updateVideo(id, updates)),
    deleteVideo: (id: string) =>
      executeOperation(() => videoService.deleteVideo(id)),

    // Gallery operations
    createImage: (image: Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeOperation(() => galleryService.createImage(image)),
    updateImage: (id: string, updates: Partial<GalleryImage>) =>
      executeOperation(() => galleryService.updateImage(id, updates)),
    deleteImage: (id: string) =>
      executeOperation(() => galleryService.deleteImage(id)),

    // Breaking news operations
    createBreakingNews: (breakingNews: Omit<BreakingNews, 'id' | 'createdAt' | 'updatedAt'>) =>
      executeOperation(() => breakingNewsService.createBreakingNews(breakingNews)),
    updateBreakingNews: (id: string, updates: Partial<BreakingNews>) =>
      executeOperation(() => breakingNewsService.updateBreakingNews(id, updates)),
    deleteBreakingNews: (id: string) =>
      executeOperation(() => breakingNewsService.deleteBreakingNews(id))
  };
};
