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
import { getCategoryDisplayName } from "@/utils/categoryMappings";
import { getStateDisplayName, getStateByCode } from "@/utils/indianStates";
import { useTranslatedArticles } from "@/hooks/useTranslatedContent";
import { useScrollToTopOnRouteChange } from "@/hooks/useScrollToTop";
import { useEffect } from "react";
import { scrollToTop } from "@/utils/scrollUtils";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function StateCategoryPage() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as 'hi' | 'en';
  const { state } = useParams<{ state: string }>();
  const location = useLocation();

  // Scroll to top when route changes
  useScrollToTopOnRouteChange();

  // Additional scroll to top when state parameter changes
  useEffect(() => {
    scrollToTop();
  }, [state]);

  // Get state information
  const stateInfo = state ? getStateByCode(state.toUpperCase()) : null;
  const stateDisplayName = stateInfo ? stateInfo.name[currentLanguage] : '';

  // For national news, we use 'national' category
  // For state-specific news, we use 'national' category with state filter
  const firestoreCategory = 'national';
  const categoryName = getCategoryDisplayName(firestoreCategory, currentLanguage);

  // Fetch news with state filter if applicable
  const { news, loading, error, refetch } = useNews(firestoreCategory, 'published', state?.toUpperCase());

  // Translate articles
  const { translatedArticles, isTranslating } = useTranslatedArticles(news?.items || []);

  // Ensure we always have a valid array for pagination
  const safeTranslatedArticles = translatedArticles || [];

  // Pagination
  const itemsPerPage = 20;
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
  } = usePagination({ data: safeTranslatedArticles, itemsPerPage });

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

  const paginationItems = generatePaginationItems();

  if (loading || isTranslating) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-200 rounded-lg h-32 sm:h-24"></div>
                  <div className="sm:col-span-2 space-y-2">
                    <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                    <div className="bg-gray-200 rounded h-3 w-full"></div>
                    <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center py-8">
            <p className="text-red-600">{t('error_loading_news')}</p>
            <p className="text-sm text-gray-600 mt-2">Error: {error}</p>
            <button onClick={refetch} className="mt-2 text-primary hover:underline">
              {t('try_again')}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const pageTitle = state
    ? `${stateDisplayName} ${t('news', 'समाचार')}`
    : categoryName;

  const pageDescription = state
    ? `${stateDisplayName} से ताज़ा समाचार और अपडेट्स`
    : `${categoryName} की ताज़ा खबरें और समाचार`;

  console.log('🏛️ Rendering main content with:', {
    pageTitle,
    pageDescription,
    newsItemsLength: news?.items?.length,
    currentItemsLength: currentItems?.length
  });

  return (
    <Layout>
      <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {pageTitle}
              </h1>
              {state && stateInfo && (
                <Badge variant="outline" className="ml-2">
                  {stateInfo.type === 'state' ? 'राज्य' : 'केंद्र शासित प्रदेश'}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {pageDescription}
            </p>
          </div>

          {/* Ad Container */}
          <div className="mb-6 sm:mb-8">
            <AdContainer position="top" category={firestoreCategory} />
          </div>

          {/* News Content */}
          <div className="space-y-6 sm:space-y-8">
            {news?.items.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {state ? `${stateDisplayName} में कोई समाचार नहीं मिला` : 'इस श्रेणी में कोई समाचार नहीं है'}
                </h3>
                <p className="text-muted-foreground">
                  {state ? 'इस राज्य के लिए अभी तक कोई समाचार प्रकाशित नहीं हुआ है' : 'कृपया बाद में दोबारा जांचें'}
                </p>
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
                        category={state ? `${categoryName} - ${stateDisplayName}` : categoryName}
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
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={prevPage}
                            className={!canGoPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {paginationItems.map((item, index) => (
                          <PaginationItem key={index}>
                            {item === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => goToPage(item as number)}
                                isActive={currentPage === item}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={nextPage}
                            className={!canGoNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Ad */}
          <div className="mt-8 sm:mt-12">
            <AdContainer position="bottom" category={firestoreCategory} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
