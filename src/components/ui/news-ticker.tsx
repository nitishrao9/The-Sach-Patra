import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useFirebaseData";
import { useTranslatedArticles } from "@/hooks/useTranslatedContent";
import { useTranslation } from "react-i18next";

interface NewsTickerProps {
  className?: string;
}

export function NewsTicker({ className = "" }: NewsTickerProps) {
  const { t } = useTranslation();

  // Fetch latest news (limit to 15 for ticker)
  const { news, loading } = useNews(undefined, 'published');
  const { translatedArticles } = useTranslatedArticles(news.items.slice(0, 15));

  if (loading || translatedArticles.length === 0) {
    return (
      <div className={`bg-black text-white py-2 overflow-hidden ${className}`}>
        <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center">
            <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold mr-4 flex-shrink-0">
              {t('latest_news') || 'ताज़ा खबरें'}
            </span>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create a continuous string of all news titles with separators
  const newsString = translatedArticles
    .map((article, index) => `${article.title}`)
    .join(' • ');

  return (
    <div className={`bg-black text-white py-2 overflow-hidden ${className}`}>
      <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center">
          {/* Latest News Label */}
          <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold mr-4 flex-shrink-0">
            {t('latest_news') || 'ताज़ा खबरें'}
          </span>

          {/* Continuous Scrolling News */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-scroll-continuous whitespace-nowrap">
              {/* First copy */}
              <span className="inline-block">
                {translatedArticles.map((article, index) => (
                  <span key={`first-${article.id}`} className="inline">
                    <Link
                      to={`/news/${article.id}`}
                      className="text-white hover:text-yellow-300 transition-colors duration-200 text-sm"
                    >
                      {article.title}
                    </Link>
                    {index < translatedArticles.length - 1 && (
                      <span className="mx-4 text-gray-400">•</span>
                    )}
                  </span>
                ))}
              </span>

              {/* Separator between loops */}
              <span className="mx-4 text-gray-400">•</span>

              {/* Second copy for seamless loop */}
              <span className="inline-block">
                {translatedArticles.map((article, index) => (
                  <span key={`second-${article.id}`} className="inline">
                    <Link
                      to={`/news/${article.id}`}
                      className="text-white hover:text-yellow-300 transition-colors duration-200 text-sm"
                    >
                      {article.title}
                    </Link>
                    {index < translatedArticles.length - 1 && (
                      <span className="mx-4 text-gray-400">•</span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
