import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsArticle } from '@/types';

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  relevanceScore: number;
}

export const searchService = {
  // Search articles by title and content
  async searchArticles(searchTerm: string, maxResults: number = 10): Promise<SearchResult[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Get all published articles
      const q = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(100) // Get more articles to search through
      );

      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt || doc.data().createdAt?.toDate()?.toLocaleDateString('hi-IN') || new Date().toLocaleDateString('hi-IN'),
      })) as NewsArticle[];

      // Filter and score articles based on search term
      const searchResults: SearchResult[] = [];

      articles.forEach(article => {
        let relevanceScore = 0;
        const titleLower = article.title.toLowerCase();
        const excerptLower = article.excerpt.toLowerCase();
        const contentLower = article.content.toLowerCase();
        const categoryLower = article.category.toLowerCase();

        // Score based on matches in different fields
        if (titleLower.includes(searchTermLower)) {
          relevanceScore += 10; // Title matches are most important
          if (titleLower.startsWith(searchTermLower)) {
            relevanceScore += 5; // Bonus for title starting with search term
          }
        }

        if (excerptLower.includes(searchTermLower)) {
          relevanceScore += 5; // Excerpt matches
        }

        if (contentLower.includes(searchTermLower)) {
          relevanceScore += 3; // Content matches
        }

        if (categoryLower.includes(searchTermLower)) {
          relevanceScore += 2; // Category matches
        }

        // Check tags
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTermLower)) {
              relevanceScore += 4; // Tag matches
            }
          });
        }

        // Only include articles with some relevance
        if (relevanceScore > 0) {
          searchResults.push({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            category: article.category,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            relevanceScore
          });
        }
      });

      // Sort by relevance score (highest first) and return limited results
      return searchResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);

    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  },

  // Get search suggestions based on partial input
  async getSearchSuggestions(partialTerm: string, maxSuggestions: number = 5): Promise<string[]> {
    if (!partialTerm.trim() || partialTerm.length < 2) {
      return [];
    }

    try {
      const searchResults = await this.searchArticles(partialTerm, 20);
      const suggestions = new Set<string>();

      // Extract keywords from titles
      searchResults.forEach(result => {
        const words = result.title.split(' ');
        words.forEach(word => {
          const cleanWord = word.replace(/[^\u0900-\u097F\u0041-\u005A\u0061-\u007A]/g, '').toLowerCase();
          if (cleanWord.length > 2 && cleanWord.includes(partialTerm.toLowerCase())) {
            suggestions.add(cleanWord);
          }
        });
      });

      return Array.from(suggestions).slice(0, maxSuggestions);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }
};
