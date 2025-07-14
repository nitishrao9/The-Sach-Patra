import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';
import { NewsArticle } from '@/types';

// Translation cache to prevent repeated translations
const translationCache = new Map<string, NewsArticle>();

// Helper function to create cache key
const createCacheKey = (articleId: string, language: string) => `${articleId}_${language}`;

// Hook to translate article content based on current language
export const useTranslatedArticle = (article: NewsArticle | null) => {
  const { i18n } = useTranslation();
  const [translatedArticle, setTranslatedArticle] = useState<NewsArticle | null>(article);
  const [isTranslating, setIsTranslating] = useState(false);

  // Memoize cache key to prevent unnecessary recalculations
  const cacheKey = useMemo(() =>
    article ? createCacheKey(article.id, i18n.language) : null,
    [article?.id, i18n.language]
  );

  useEffect(() => {
    if (!article || !cacheKey) {
      setTranslatedArticle(null);
      return;
    }

    // Check cache first
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslatedArticle(cached);
      return;
    }

    const translateArticle = async () => {
      setIsTranslating(true);
      try {
        const currentLang = i18n.language as 'hi' | 'en';
        const translated = await translationService.translateArticle(article, currentLang);

        // Cache the result
        translationCache.set(cacheKey, translated);
        setTranslatedArticle(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedArticle(article); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateArticle();
  }, [article, cacheKey]);

  return { translatedArticle, isTranslating };
};

// Hook to translate array of articles
export const useTranslatedArticles = (articles: NewsArticle[]) => {
  const { i18n } = useTranslation();
  const [translatedArticles, setTranslatedArticles] = useState<NewsArticle[]>(articles);
  const [isTranslating, setIsTranslating] = useState(false);

  // Memoize articles to prevent unnecessary re-translations
  const memoizedArticles = useMemo(() => articles, [JSON.stringify(articles.map(a => a.id))]);

  useEffect(() => {
    if (!memoizedArticles || memoizedArticles.length === 0) {
      setTranslatedArticles([]);
      return;
    }

    const translateArticles = async () => {
      setIsTranslating(true);
      try {
        const currentLang = i18n.language as 'hi' | 'en';
        const results: NewsArticle[] = [];

        // Process articles in batches to prevent overwhelming the system
        for (const article of memoizedArticles) {
          const cacheKey = createCacheKey(article.id, currentLang);
          const cached = translationCache.get(cacheKey);

          if (cached) {
            results.push(cached);
          } else {
            try {
              const translated = await translationService.translateArticle(article, currentLang);
              translationCache.set(cacheKey, translated);
              results.push(translated);
            } catch (error) {
              console.error(`Translation failed for article ${article.id}:`, error);
              results.push(article); // Fallback to original
            }
          }
        }

        setTranslatedArticles(results);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedArticles(memoizedArticles); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateArticles();
  }, [memoizedArticles, i18n.language]);

  return { translatedArticles, isTranslating };
};

// Hook for translating single text
export const useTranslatedText = (text: string) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    const translateText = async () => {
      setIsTranslating(true);
      try {
        const currentLang = i18n.language as 'hi' | 'en';
        const sourceLang = currentLang === 'hi' ? 'en' : 'hi';
        const translated = await translationService.translateText(text, currentLang, sourceLang);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(text); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, i18n.language]);

  return { translatedText, isTranslating };
};
