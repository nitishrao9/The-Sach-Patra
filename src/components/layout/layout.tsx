import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Suspense } from "react";
import { BreakingNewsTicker } from "../news/breaking-news-ticker";
import { useBreakingNews } from "@/hooks/useFirebaseData";

interface LayoutProps {
  children: React.ReactNode;
  hideBreakingNews?: boolean;
}

export function Layout({ children, hideBreakingNews = false }: LayoutProps) {
  const { breakingNews, loading: breakingLoading } = useBreakingNews();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {!hideBreakingNews && (
        <div className="min-h-[52px] sm:min-h-[60px]">
          {!breakingLoading && breakingNews.length > 0 && (
            <BreakingNewsTicker items={breakingNews.map(item => ({ id: item.id, title: item.title }))} />
          )}
        </div>
      )}
      <main className="flex-1">
        <Suspense fallback={
          <div className="container py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}