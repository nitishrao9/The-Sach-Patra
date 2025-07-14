import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsArticle, Advertisement, User, PaginationData, Video, GalleryImage, BreakingNews } from '@/types';

// News Service
export const newsService = {
  // Get all news articles with pagination - simplified to avoid complex indexing
  async getNews(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot,
    category?: string,
    status: 'published' | 'draft' | 'all' = 'published',
    state?: string
  ): Promise<PaginationData<NewsArticle>> {
    try {
      let q;

      // Ultra-simple approach: get all news, then filter client-side
      // This avoids all indexing issues
      q = query(
        collection(db, 'news'),
        orderBy('createdAt', 'desc'),
        limit(100) // Get more to allow for filtering (increased for state filtering)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);

      let items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Ensure required fields have defaults
          tags: data.tags || [],
          commentsCount: data.commentsCount || 0,
          featured: data.featured || false
        };
      }) as NewsArticle[];

      // Client-side filtering
      if (status !== 'all') {
        items = items.filter(item => item.status === status);
      }

      if (category) {
        // Since categories are stored in English in Firebase, convert URL slug to English category
        const { getFirebaseCategory } = await import('@/utils/categoryMappings');
        const englishCategory = getFirebaseCategory(category);

        // Filter by English category name (since that's how they're stored in Firebase)
        items = items.filter(item => {
          return item.category === englishCategory;
        });
      }

      // State filtering for national news
      if (state && category === 'national') {
        items = items.filter(item => {
          // Check if article has state field and matches
          const hasStateField = item.state === state;

          // Also check if state is mentioned in title, content, or tags
          const stateInTitle = item.title.toLowerCase().includes(state.toLowerCase());
          const stateInContent = item.content.toLowerCase().includes(state.toLowerCase());
          const stateInTags = item.tags && item.tags.some(tag =>
            tag.toLowerCase().includes(state.toLowerCase())
          );

          return hasStateField || stateInTitle || stateInContent || stateInTags;
        });
      }

      // Limit to requested page size
      items = items.slice(0, pageSize);

      // Simple total count estimation
      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        items,
        currentPage: 1,
        totalPages: Math.max(1, totalPages),
        totalItems,
        itemsPerPage: pageSize
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty result on error
      return {
        items: [],
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: pageSize
      };
    }
  },

  // Get single news article
  async getNewsById(id: string): Promise<NewsArticle | null> {
    const docRef = doc(db, 'news', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
      } as NewsArticle;
    }
    
    return null;
  },

  // Create news article
  async createNews(article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'news'), {
      ...article,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Update news article
  async updateNews(id: string, updates: Partial<NewsArticle>): Promise<void> {
    const docRef = doc(db, 'news', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete news article
  async deleteNews(id: string): Promise<void> {
    const docRef = doc(db, 'news', id);
    await deleteDoc(docRef);
  },

  // Track article view
  async trackView(id: string): Promise<void> {
    const docRef = doc(db, 'news', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1
      });
    }
  },

  // Get most viewed articles
  async getMostViewedNews(limitCount: number = 10): Promise<NewsArticle[]> {
    try {
      // First try to get articles ordered by views
      const q = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        orderBy('views', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as NewsArticle[];
      }

      // If no articles with views, fallback to latest published articles
      const fallbackQuery = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const fallbackSnapshot = await getDocs(fallbackQuery);
      return fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        views: doc.data().views || 0,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as NewsArticle[];

    } catch (error) {
      console.error('Error fetching most viewed news:', error);
      // Return empty array on error
      return [];
    }
  },

  // Initialize views field for existing articles (run once)
  async initializeViewsForExistingArticles(): Promise<void> {
    try {
      const q = query(collection(db, 'news'));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      let updateCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.views === undefined) {
          batch.update(doc.ref, { views: 0 });
          updateCount++;
        }
      });

      if (updateCount > 0) {
        await batch.commit();
        console.log(`Initialized views field for ${updateCount} articles`);
      }
    } catch (error) {
      console.error('Error initializing views for existing articles:', error);
    }
  },

  // Get featured news - simplified to avoid complex indexing
  async getFeaturedNews(): Promise<NewsArticle[]> {
    try {
      // First try to get published articles, then filter for featured
      const q = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(20) // Get more to filter for featured
      );

      const snapshot = await getDocs(q);
      const allPublished = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as NewsArticle[];

      // Filter for featured articles
      const featured = allPublished.filter(article => article.featured === true).slice(0, 5);

      return featured;
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return [];
    }
  }
};

// Advertisement Service
export const adService = {
  // Get active advertisements by position
  async getAdsByPosition(position: Advertisement['position'], category?: string): Promise<Advertisement[]> {
    try {
      console.log(`adService.getAdsByPosition called with position: ${position}, category: ${category}`);

      // Get all ads for this position first, then filter client-side
      // This avoids complex Firestore indexing issues
      const q = query(
        collection(db, 'advertisements'),
        where('position', '==', position)
      );

      const snapshot = await getDocs(q);
      console.log(`Firebase query returned ${snapshot.size} documents for position: ${position}`);

      let ads = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Processing ad document:`, { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }) as Advertisement[];

      console.log(`Mapped ads:`, ads);

      // Filter by active status first
      ads = ads.filter(ad => {
        console.log(`Ad ${ad.id} isActive check: ${ad.isActive}`);
        return ad.isActive;
      });
      console.log(`After isActive filter: ${ads.length} ads`);

      // Filter by category client-side if category is provided
      if (category) {
        const beforeFilter = ads.length;
        ads = ads.filter(ad => {
          const matches = !ad.category || // General ads (no category)
            ad.category === '' || // Empty category
            ad.category === category || // Exact match
            ad.category === null; // Null category
          console.log(`Category filter for ad ${ad.id}: category="${ad.category}", matches=${matches}`);
          return matches;
        });
        console.log(`Category filtering: ${beforeFilter} -> ${ads.length} ads`);
      }

      console.log(`Final ads result:`, ads);
      return ads;
    } catch (error) {
      console.error('Error fetching ads:', error);
      return [];
    }
  },

  // Get all advertisements for admin
  async getAllAds(): Promise<Advertisement[]> {
    const q = query(collection(db, 'advertisements'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate() || new Date(),
      endDate: doc.data().endDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Advertisement[];
  },

  // Create advertisement
  async createAd(ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'impressionCount'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'advertisements'), {
      ...ad,
      clickCount: 0,
      impressionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Update advertisement
  async updateAd(id: string, updates: Partial<Advertisement>): Promise<void> {
    const docRef = doc(db, 'advertisements', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete advertisement
  async deleteAd(id: string): Promise<void> {
    const docRef = doc(db, 'advertisements', id);
    await deleteDoc(docRef);
  },

  // Track ad impression
  async trackImpression(id: string): Promise<void> {
    const docRef = doc(db, 'advertisements', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentCount = docSnap.data().impressionCount || 0;
      await updateDoc(docRef, {
        impressionCount: currentCount + 1
      });
    }
  },

  // Track ad click
  async trackClick(id: string): Promise<void> {
    const docRef = doc(db, 'advertisements', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentCount = docSnap.data().clickCount || 0;
      await updateDoc(docRef, {
        clickCount: currentCount + 1
      });
    }
  }
};

// User Service
export const userService = {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as User[];
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
      } as User;
    }
    
    return null;
  },

  // Update user role (admin only)
  async updateUserRole(id: string, role: User['role']): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      role,
      updatedAt: new Date()
    });
  },

  // Update user profile
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete user (admin only)
  async deleteUser(id: string): Promise<void> {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  }
};

// Video service
export const videoService = {
  // Get all videos
  async getAllVideos(): Promise<Video[]> {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Video[];
  },

  // Get featured videos (limited)
  async getFeaturedVideos(limitCount: number = 6): Promise<Video[]> {
    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Video[];
  },

  // Create video
  async createVideo(video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'videos'), {
      ...video,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Update video
  async updateVideo(id: string, updates: Partial<Video>): Promise<void> {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete video
  async deleteVideo(id: string): Promise<void> {
    const docRef = doc(db, 'videos', id);
    await deleteDoc(docRef);
  }
};

// Gallery service
export const galleryService = {
  // Get all gallery images
  async getAllImages(): Promise<GalleryImage[]> {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as GalleryImage[];
  },

  // Get featured gallery images (limited)
  async getFeaturedImages(limitCount: number = 6): Promise<GalleryImage[]> {
    const q = query(
      collection(db, 'gallery'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as GalleryImage[];
  },

  // Create gallery image
  async createImage(image: Omit<GalleryImage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'gallery'), {
      ...image,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Update gallery image
  async updateImage(id: string, updates: Partial<GalleryImage>): Promise<void> {
    const docRef = doc(db, 'gallery', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete gallery image
  async deleteImage(id: string): Promise<void> {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  }
};

// Breaking news service
export const breakingNewsService = {
  // Get all breaking news
  async getAllBreakingNews(): Promise<BreakingNews[]> {
    const q = query(collection(db, 'breakingNews'), orderBy('priority', 'desc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as BreakingNews[];
  },

  // Get active breaking news
  async getActiveBreakingNews(): Promise<BreakingNews[]> {
    const q = query(
      collection(db, 'breakingNews'),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as BreakingNews[];
  },

  // Create breaking news
  async createBreakingNews(breakingNews: Omit<BreakingNews, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'breakingNews'), {
      ...breakingNews,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  // Update breaking news
  async updateBreakingNews(id: string, updates: Partial<BreakingNews>): Promise<void> {
    const docRef = doc(db, 'breakingNews', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete breaking news
  async deleteBreakingNews(id: string): Promise<void> {
    const docRef = doc(db, 'breakingNews', id);
    await deleteDoc(docRef);
  }
};
