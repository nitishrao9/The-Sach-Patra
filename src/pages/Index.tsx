import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/layout";
import { NewsCardLarge } from "@/components/news/news-card-large";
import { NewsCardHorizontal } from "@/components/news/news-card-horizontal";
import { NewsCardSmall } from "@/components/news/news-card-small";
import { FeaturedVideos } from "@/components/news/featured-videos";
import { PhotoGallery } from "@/components/news/photo-gallery";
import { AdContainer } from "@/components/ads/AdContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { useAllAds } from "@/hooks/useFirebaseData";
import { Link } from "react-router-dom";
import {
  useNews,
  useFeaturedNews,
  useNewsByCategories,
  useTrendingTags,
  useVideos,
  useGalleryImages,
  useMostViewedNews
} from "@/hooks/useFirebaseData";
import { getCategoryUrl, getCategoryDisplayName, CATEGORIES } from "@/utils/categoryMappings";
import { useTranslatedArticles } from "@/hooks/useTranslatedContent";
import { useInfiniteScroll, useInfiniteScrollObserver } from "@/hooks/useInfiniteScroll";
import { NewsCardSkeleton, NewsCardHorizontalSkeleton } from "@/components/ui/image-skeleton";
import { Suspense, lazy, useState, useEffect } from "react";

export default function Index() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'hi' | 'en';
  const [shouldLoadSecondary, setShouldLoadSecondary] = useState(false);

  // Fetch critical data first (news and featured)
  const { news: latestNewsData, loading: newsLoading, error: newsError } = useNews();
  const { featuredNews, loading: featuredLoading, error: featuredError } = useFeaturedNews();

  // Lazy load secondary data after critical content is loaded
  const { categorizedNews, loading: categorizedLoading, categories, error: categorizedError } = useNewsByCategories();
  const { trendingTags, loading: tagsLoading, error: tagsError } = useTrendingTags();
  const { videos: featuredVideos, loading: videosLoading, error: videosError } = useVideos();
  const { images: galleryImages, loading: imagesLoading, error: imagesError } = useGalleryImages();
  const { mostViewedNews, loading: mostViewedLoading, error: mostViewedError } = useMostViewedNews(5);

  // Debug: Get all ads to see what's available
  const { ads: allAds, loading: adsLoading } = useAllAds();

  // Load secondary content after critical content is ready
  useEffect(() => {
    if (!newsLoading && !featuredLoading && (latestNewsData?.items?.length || featuredNews?.length)) {
      // Delay secondary loading to prevent blocking
      const timer = setTimeout(() => {
        setShouldLoadSecondary(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [newsLoading, featuredLoading, latestNewsData?.items?.length, featuredNews?.length]);

  // Infinite scroll for more news - only initialize when secondary content is ready
  const {
    articles: infiniteArticles,
    loading: infiniteLoading,
    hasMore,
    loadMore
  } = useInfiniteScroll({ pageSize: 15, enabled: shouldLoadSecondary });

  // Translate articles based on current language
  const { translatedArticles: translatedLatestNews, isTranslating: isTranslatingLatest } = useTranslatedArticles(latestNewsData?.items || []);
  const { translatedArticles: translatedFeaturedNews, isTranslating: isTranslatingFeatured } = useTranslatedArticles(featuredNews || []);
  const { translatedArticles: translatedInfiniteNews, isTranslating: isTranslatingInfinite } = useTranslatedArticles(infiniteArticles || []);



  // Infinite scroll observer
  const loadMoreRef = useInfiniteScrollObserver(loadMore, hasMore, infiniteLoading);

  // Get featured article (first featured article or first article)
  const featuredArticle = translatedFeaturedNews[0] || translatedLatestNews[0];

  // Other articles (excluding featured) - use translated versions
  const otherArticles = translatedLatestNews.filter(article => article.id !== featuredArticle?.id);

  // Show progressive loading instead of blocking everything
  const isInitialLoading = newsLoading && featuredLoading && !translatedLatestNews.length && !translatedFeaturedNews.length;

  // Show minimal loading state only for initial load
  if (isInitialLoading) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Featured Article Skeleton */}
            <div className="mb-6 sm:mb-8">
              <NewsCardSkeleton />
            </div>
            {/* Other Articles Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <NewsCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state if there are errors
  if (newsError || featuredError || categorizedError) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">{t('error_loading_data')}</h3>
              <p className="text-red-600 text-sm mb-4">
                {newsError || featuredError || categorizedError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show message if no data
  if (latestNewsData.items.length === 0 && featuredNews.length === 0) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">कोई समाचार नहीं मिला</h3>
              <p className="text-blue-600 text-sm mb-4">
                डेटाबेस में कोई समाचार नहीं है। कृपया एडमिन पैनल से समाचार जोड़ें।
              </p>
              <a
                href="/admin/news"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                समाचार जोड़ें
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      {/* Header Advertisement - Full Width */}
      <div className="w-full mb-4 sm:mb-6">
        <AdContainer position="header" className="text-center" />
      </div>

      <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {/* Main Featured Article */}
          <div className="lg:col-span-8">
            {featuredArticle ? (
              <NewsCardLarge
                id={featuredArticle.id}
                title={featuredArticle.title}
                excerpt={featuredArticle.excerpt}
                category={featuredArticle.category}
                imageUrl={featuredArticle.imageUrl}
                publishedAt={featuredArticle.publishedAt}
                commentsCount={featuredArticle.commentsCount}
                featured={true}
              />
            ) : (
              <NewsCardSkeleton />
            )}
          </div>

          {/* Secondary Articles */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg sm:text-xl">ताज़ा खबरें</h2>
              <Link to="/latest" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center">
                और देखें <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {otherArticles.length > 0 ? (
                otherArticles.slice(0, 3).map(article => (
                  <NewsCardSmall
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    imageUrl={article.imageUrl}
                    publishedAt={article.publishedAt}
                  />
                ))
              ) : (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg animate-pulse">
                    <div className="bg-muted rounded-md aspect-square"></div>
                    <div className="col-span-2 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div>
              <div className="mb-2">
                <h3 className="font-bold">ट्रेंडिंग</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {!tagsLoading && trendingTags.map(tag => (
                  <Link key={tag.name} to={`/tag/${tag.name}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                      #{tag.name} ({tag.count})
                    </Badge>
                  </Link>
                ))}
                {tagsLoading && (
                  <div className="text-sm text-muted-foreground">ट्रेंडिंग टैग लोड हो रहे हैं...</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Category News Tabs */}
        <div className="mb-8 sm:mb-10">
          <Tabs defaultValue="national">
            <div className="border-b overflow-x-auto">
              <TabsList className="bg-transparent flex-nowrap w-full justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-sm sm:text-base px-2 sm:px-4 py-2 whitespace-nowrap"
                  >
                    {getCategoryDisplayName(category, currentLanguage)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {categorizedNews[category]?.map((article, index) => (
                    <div key={article.id}>
                      <NewsCardHorizontal
                        id={article.id}
                        title={article.title}
                        excerpt={article.excerpt}
                        category={getCategoryDisplayName(category, currentLanguage)}
                        imageUrl={article.imageUrl}
                        publishedAt={article.publishedAt}
                      />
                      {/* Insert content ad after every 2nd article */}
                      {index === 1 && (
                        <div className="my-4 sm:my-6">
                          <AdContainer position="content" category={category} />
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-muted-foreground">इस श्रेणी में कोई समाचार नहीं है।</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-6">
                  <Link
                    to={`/${getCategoryUrl(category)}`}
                    className="text-primary hover:underline flex items-center"
                  >
                    {t('view_more', { category: getCategoryDisplayName(category, currentLanguage) })} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        {/* Videos Section */}
        {!videosLoading && featuredVideos.length > 0 && (
          <div className="mb-10">
            <FeaturedVideos videos={featuredVideos} />
          </div>
        )}
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* More News */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">{t('more_news')}</h2>
              <div className="space-y-4 sm:space-y-6">
                {otherArticles.slice(3).map(article => (
                  <NewsCardHorizontal
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    excerpt={article.excerpt}
                    category={article.category}
                    imageUrl={article.imageUrl}
                    publishedAt={article.publishedAt}
                  />
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            {!imagesLoading && galleryImages.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <PhotoGallery title={t('gallery_title')} images={galleryImages} />
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* Sidebar Advertisement */}
            <AdContainer position="sidebar" className="text-center" />

            {/* Popular Articles */}
            <div>
              <h3 className="text-xl font-bold mb-4">लोकप्रिय लेख</h3>
              <div className="space-y-4">
                {mostViewedLoading ? (
                  // Loading skeleton for popular articles
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-4 animate-pulse">
                      <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  ))
                ) : mostViewedNews.length > 0 ? (
                  mostViewedNews.map((article, index) => (
                    <div key={article.id} className="group">
                      <Link to={`/news/${article.id}`} className="flex items-start gap-4 group">
                        <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground">{article.publishedAt}</p>
                            <span className="text-xs text-muted-foreground">
                              {article.views || 0} views
                            </span>
                          </div>
                        </div>
                      </Link>
                      {index < 4 && <Separator className="my-4" />}
                    </div>
                  ))
                ) : (
                  // Fallback to latest articles if no viewed articles
                  latestNewsData.items
                    .slice(0, 5)
                    .map((article, index) => (
                      <div key={article.id} className="group">
                        <Link to={`/news/${article.id}`} className="flex items-start gap-4 group">
                          <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{article.publishedAt}</p>
                          </div>
                        </Link>
                        {index < 4 && <Separator className="my-4" />}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}