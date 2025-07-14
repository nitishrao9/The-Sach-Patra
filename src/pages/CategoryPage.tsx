import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/layout";
import { NewsCardHorizontal } from "@/components/news/news-card-horizontal";
import { AdContainer } from "@/components/ads/AdContainer";
import { usePagination } from "@/hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { useNews } from "@/hooks/useFirebaseData";
import { getCategoryDisplayName, getCategoryFromUrl } from "@/utils/categoryMappings";
import { useTranslatedArticles } from "@/hooks/useTranslatedContent";
import { useScrollToTopOnRouteChange } from "@/hooks/useScrollToTop";

export default function CategoryPage() {
  const { t, i18n } = useTranslation();
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const currentLanguage = i18n.language as 'hi' | 'en';

  // Scroll to top when route changes
  useScrollToTopOnRouteChange();

  // Get the category from URL - either from params or from pathname
  const getCategoryFromPath = () => {
    if (category) {
      // If we have a category param (from /category/:category route)
      return getCategoryFromUrl(category);
    } else {
      // If we're on a direct route like /national, /politics, etc.
      const pathname = location.pathname.replace('/', ''); // Remove leading slash
      return getCategoryFromUrl(pathname);
    }
  };

  const actualCategory = getCategoryFromPath();

  // Get the localized name of the category for display
  const categoryName = getCategoryDisplayName(actualCategory, currentLanguage);

  // For Firebase queries, use the English category name
  const firestoreCategory = actualCategory === 'latest' ? '' : actualCategory;

  // Fetch news from Firestore
  const { news, loading, error } = useNews(
    firestoreCategory || undefined,
    'published'
  );

  // Translate articles based on current language
  const { translatedArticles, isTranslating } = useTranslatedArticles(news.items || []);

  console.log('🏠 CategoryPage Debug:', {
    pathname: location.pathname,
    urlCategory: category,
    actualCategory,
    displayName: categoryName,
    firestoreCategory,
    newsCount: news.items.length,
    loading,
    error,
    allNewsItems: news.items.map(item => ({ id: item.id, title: item.title, category: item.category }))
  });

  // Debug: Show all unique categories in the database
  console.log('🗂️ All unique categories in database:', [...new Set(news.items.map(item => item.category))]);

  // Use pagination hook with 20 items per page - use translated articles
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: translatedArticles,
    itemsPerPage: 20
  });

  // Show loading state
  if (loading || isTranslating) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">समाचार लोड हो रहे हैं...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{t('error_loading_news')}: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-4 sm:py-6 px-4 sm:px-6">
        {/* Header Advertisement */}
        <div className="mb-4 sm:mb-6">
          <AdContainer position="header" category={categoryName} className="text-center" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{categoryName}</h1>
              {totalItems > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{endIndex} of {totalItems} articles
                </p>
              )}
            </div>

            {news.items.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground">{t('no_news_in_category')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {currentItems.map((article, index) => (
                    <div key={article.id}>
                      <NewsCardHorizontal
                        id={article.id}
                        title={article.title}
                        excerpt={article.excerpt || ""}
                        category={article.category || categoryName}
                        imageUrl={article.imageUrl}
                        publishedAt={article.publishedAt}
                      />
                      {/* Insert content ad after every 3rd article */}
                      {(index + 1) % 3 === 0 && (
                        <div className="my-4 sm:my-6">
                          <AdContainer position="content" category={firestoreCategory} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (canGoPrev) goToPage(currentPage - 1);
                            }}
                            className={!canGoPrev ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    goToPage(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (canGoNext) goToPage(currentPage + 1);
                            }}
                            className={!canGoNext ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="sticky top-6 space-y-4 sm:space-y-6">
              <AdContainer position="sidebar" category={firestoreCategory} maxAds={3} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}