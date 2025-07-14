import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/layout';
import { NewsCardHorizontal } from '@/components/news/news-card-horizontal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { searchService, SearchResult } from '@/services/searchService';
import { useTranslatedArticles } from '@/hooks/useTranslatedContent';

export default function SearchResults() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Translate search results
  const { translatedArticles: translatedResults, isTranslating } = useTranslatedArticles(
    results.map(result => ({
      id: result.id,
      title: result.title,
      excerpt: result.excerpt,
      category: result.category,
      imageUrl: result.imageUrl,
      publishedAt: result.publishedAt,
      content: '',
      author: '',
      featured: false,
      status: 'published' as const,
      tags: [],
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );

  const performSearch = async (term: string) => {
    if (!term.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const searchResults = await searchService.searchArticles(term, 20);
      setResults(searchResults);
      
      // Update URL with search term
      setSearchParams({ q: term });
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  // Perform search on component mount if there's a query parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [searchParams]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-none py-4 sm:py-6 px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              {t('search_results', 'खोज परिणाम')}
            </h1>
            
            {/* Search Form */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="search"
                      placeholder={t('search_placeholder', 'समाचार खोजें...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('search', 'खोजें')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          {loading || isTranslating ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                    <div className="bg-gray-200 rounded-lg h-32 sm:h-24"></div>
                    <div className="sm:col-span-2 space-y-2">
                      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                      <div className="bg-gray-200 rounded h-3 w-full"></div>
                      <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : hasSearched ? (
            <>
              {/* Results Count */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {translatedResults.length > 0 
                    ? `${translatedResults.length} परिणाम मिले "${searchTerm}" के लिए`
                    : `"${searchTerm}" के लिए कोई परिणाम नहीं मिला`
                  }
                </p>
                {searchTerm && (
                  <Badge variant="outline" className="text-xs">
                    {searchTerm}
                  </Badge>
                )}
              </div>

              {/* Results List */}
              {translatedResults.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {translatedResults.map((article) => (
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
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">कोई परिणाम नहीं मिला</h3>
                    <p className="text-muted-foreground mb-4">
                      कृपया अलग कीवर्ड का उपयोग करके दोबारा खोजें
                    </p>
                    <div className="text-sm text-muted-foreground">
                      <p>सुझाव:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>सामान्य शब्दों का उपयोग करें</li>
                        <li>वर्तनी की जांच करें</li>
                        <li>कम शब्दों का उपयोग करें</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">समाचार खोजें</h3>
                <p className="text-muted-foreground">
                  ऊपर दिए गए खोज बॉक्स में अपना कीवर्ड डालें
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
