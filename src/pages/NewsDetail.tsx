import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/layout";
import { NewsCardSmall } from "@/components/news/news-card-small";
import { CommentSection } from "@/components/comments/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Facebook, Linkedin, Link2, MessageSquare, Calendar, User, Loader2 } from "lucide-react";
import { XIcon } from "@/components/icons/XIcon";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NewsArticle } from "@/types";
import { useNews } from "@/hooks/useFirebaseData";
import { useTranslatedArticle, useTranslatedArticles } from "@/hooks/useTranslatedContent";
import { ImageWithSkeleton, ArticleDetailSkeleton } from "@/components/ui/image-skeleton";
import { useScrollToTopOnRouteChange } from "@/hooks/useScrollToTop";
import { newsService } from "@/services/firebaseService";

export default function NewsDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when route changes (when opening different articles)
  useScrollToTopOnRouteChange();

  // Fetch related articles from the same category
  const { news: relatedNewsData } = useNews(article?.category, 'published');

  // Translate article content based on current language
  const { translatedArticle, isTranslating } = useTranslatedArticle(article);
  const { translatedArticles: translatedRelatedNews, isTranslating: isTranslatingRelated } = useTranslatedArticles(relatedNewsData?.items || []);



  // Get the article from Firestore
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            publishedAt: data.publishedAt || data.createdAt?.toDate()?.toLocaleDateString('hi-IN') || new Date().toLocaleDateString('hi-IN'),
            tags: data.tags || [],
            commentsCount: data.commentsCount || 0,
            views: data.views || 0,
            featured: data.featured || false
          } as NewsArticle);

          // Track view count (only for published articles)
          if (data.status === 'published') {
            try {
              await newsService.trackView(id);
            } catch (error) {
              console.error('Error tracking view:', error);
            }
          }
        } else {
          console.log('Article not found for ID:', id);
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Related articles (excluding current article) - use translated versions
  const relatedArticles = translatedRelatedNews
    .filter(a => a.id !== id)
    .slice(0, 6);

  // Show loading state with skeleton
  if (loading || isTranslating) {
    return (
      <Layout>
        <ArticleDetailSkeleton />
      </Layout>
    );
  }

  // Show error state
  if (error || !translatedArticle) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('news_not_found')}</h1>
          <p className="text-muted-foreground mb-4">
            {error || t('news_not_available')}
          </p>
          <Button onClick={() => window.history.back()}>
            {t('back')}
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <article>
              {/* Category and Date */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge className="bg-primary hover:bg-primary/80 text-xs sm:text-sm">
                  {translatedArticle.category}
                </Badge>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {translatedArticle.publishedAt}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                {translatedArticle.title}
              </h1>

              {/* Author */}
              <div className="flex items-center mb-4 sm:mb-6">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${translatedArticle.author}&background=random`} alt={translatedArticle.author} />
                  <AvatarFallback>{translatedArticle.author?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center text-sm sm:text-base">
                    <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    {translatedArticle.author}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t('journalist', 'पत्रकार')}</div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-4 sm:mb-6">
                {translatedArticle.imageUrl ? (
                  <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={translatedArticle.imageUrl}
                      alt={translatedArticle.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden absolute inset-0 w-full h-full bg-gray-200 items-center justify-center">
                      <p className="text-gray-500">Image failed to load</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No image URL provided</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-6 sm:mb-8"
                dangerouslySetInnerHTML={{ __html: translatedArticle.content }}
              />

              {/* Additional Images */}
              {translatedArticle.additionalImages && translatedArticle.additionalImages.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">More Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {translatedArticle.additionalImages.map((imageUrl, index) => (
                      <div key={index} className="relative w-full h-48 sm:h-64 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="hidden absolute inset-0 w-full h-full bg-gray-200 items-center justify-center">
                          <p className="text-gray-500 text-sm">Image not available</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Links */}
              {translatedArticle.relatedLinks && translatedArticle.relatedLinks.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Related Links</h3>
                  <div className="space-y-3">
                    {translatedArticle.relatedLinks.map((link, index) => (
                      <div key={link.id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h4 className="font-medium text-primary hover:underline mb-1">
                            {link.title}
                          </h4>
                          {link.description && (
                            <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                          )}
                          <p className="text-xs text-gray-500 break-all">{link.url}</p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">{t('tags', 'टैग्स')}</h3>
                <div className="flex flex-wrap gap-2">
                  {translatedArticle.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="hover:bg-secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Share */}
              <div className="mb-8">
                <h3 className="font-medium mb-3">{t('share', 'शेयर करें')}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <XIcon size={16} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Link2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mb-8">
                <CommentSection articleId={translatedArticle.id} />
              </div>
            </article>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 mt-6 lg:mt-0">
            {/* Related News */}
            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4">संबंधित समाचार</h3>
              <div className="space-y-3 sm:space-y-4">
                {relatedArticles.map((relatedArticle, index) => (
                  <div key={relatedArticle.id}>
                    <NewsCardSmall
                      id={relatedArticle.id}
                      title={relatedArticle.title}
                      imageUrl={relatedArticle.imageUrl}
                      publishedAt={relatedArticle.publishedAt || relatedArticle.createdAt?.toLocaleDateString('hi-IN') || ''}
                    />
                    {index < relatedArticles.length - 1 && <Separator className="mt-3 sm:mt-4" />}
                  </div>
                ))}
                {relatedArticles.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>कोई संबंधित समाचार उपलब्ध नहीं है।</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}