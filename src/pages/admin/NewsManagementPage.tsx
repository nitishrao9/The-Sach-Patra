import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  RefreshCw,
  Loader2,
  FileText,
  Globe,
  Clock,
  TrendingUp
} from 'lucide-react';
import { NewsArticle } from '@/types';
import { getAllCategories, getCategoryDisplayName } from '@/utils/categoryMappings';
import { getAllStatesForDropdown } from '@/utils/indianStates';
import { getCustomCategories, addCustomCategory } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { getDirectImageUrl, isValidImageUrl } from '@/utils/imageUtils';

const NewsManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTab, setCurrentTab] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyMyArticles, setShowOnlyMyArticles] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    state: 'all',
    imageUrl: '',
    additionalImages: [] as string[],
    videoUrl: '',
    relatedLinks: [] as { id: string; title: string; url: string; description?: string }[],
    author: currentUser?.displayName || currentUser?.email || '',
    featured: false,
    latestNews: false,
    status: 'draft' as NewsArticle['status'],
    tags: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Helper functions for additional images
  const addAdditionalImage = () => {
    setFormData(prev => ({
      ...prev,
      additionalImages: [...prev.additionalImages, '']
    }));
  };

  const updateAdditionalImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.map((img, i) => i === index ? value : img)
    }));
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  // Helper functions for related links
  const addRelatedLink = () => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: [...prev.relatedLinks, { id: Date.now().toString(), title: '', url: '', description: '' }]
    }));
  };

  const updateRelatedLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeRelatedLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((_, i) => i !== index)
    }));
  };

  // Categories for the select dropdown - using English for admin panel
  const categoryOptions = getAllCategories('en', customCategories);
  const categories = categoryOptions.map(cat => cat.value);

  // States for the select dropdown - using English for admin panel
  const stateOptions = getAllStatesForDropdown('en');

  // Load articles from Firestore
  const loadArticles = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const articlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt || new Date().toLocaleString(),
        views: doc.data().views || 0,
        tags: doc.data().tags || [],
        commentsCount: doc.data().commentsCount || 0
      })) as NewsArticle[];
      
      setArticles(articlesData);
      setError(null);
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Handle edit from dashboard
  useEffect(() => {
    if (location.state?.editArticle) {
      const article = location.state.editArticle;
      handleEdit(article);
      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Calculate stats
  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    featured: articles.filter(a => a.featured).length,
    latestNews: articles.filter(a => a.latestNews).length
  };

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesTab = currentTab === 'all' ||
                      (currentTab === 'published' && article.status === 'published') ||
                      (currentTab === 'draft' && article.status === 'draft') ||
                      (currentTab === 'featured' && article.featured) ||
                      (currentTab === 'latestNews' && article.latestNews);
    const matchesOwnership = !showOnlyMyArticles || article.createdBy === currentUser?.id;

    return matchesSearch && matchesCategory && matchesStatus && matchesTab && matchesOwnership;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      state: 'all',
      imageUrl: '',
      additionalImages: [],
      videoUrl: '',
      relatedLinks: [],
      author: currentUser?.displayName || currentUser?.email || '',
      featured: false,
      latestNews: false,
      status: 'draft',
      tags: ''
    });
    setEditingArticle(null);
    setImageFile(null);
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const fileName = `news-images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('कृपया केवल इमेज फाइल चुनें');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('इमेज का साइज 5MB से कम होना चाहिए');
        return;
      }

      setImageFile(file);
    }
  };

  // Check if current user can edit/delete a specific article
  const canEditArticle = (article: NewsArticle) => {
    // Admins can edit any article
    if (currentUser?.role === 'admin') {
      return true;
    }

    // Editors can only edit their own articles
    if (currentUser?.role === 'editor') {
      return article.createdBy === currentUser.id;
    }

    return false;
  };

  const handleEdit = (article: NewsArticle) => {
    if (!canEditArticle(article)) {
      setError('You can only edit your own articles');
      return;
    }

    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      state: article.state || 'all', // Convert empty string to "all" for form display
      imageUrl: article.imageUrl,
      additionalImages: article.additionalImages || [],
      videoUrl: article.videoUrl || '',
      relatedLinks: article.relatedLinks || [],
      author: article.author,
      featured: article.featured || false,
      latestNews: article.latestNews || false,
      status: article.status,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const articleData = {
        ...formData,
        imageUrl,
        additionalImages: formData.additionalImages.filter(img => img.trim() !== ''), // Remove empty image URLs
        relatedLinks: formData.relatedLinks.filter(link => link.title.trim() !== '' && link.url.trim() !== ''), // Remove empty links
        state: formData.state === 'all' ? '' : formData.state, // Convert "all" back to empty string for database
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date(),
        ...(editingArticle ? {} : {
          createdAt: new Date(),
          createdBy: currentUser?.id, // Track who created the article
          views: 0,
          commentsCount: 0
        })
      };

      console.log('Saving article with imageUrl:', imageUrl);
      console.log('Full article data:', articleData);

      if (editingArticle) {
        const articleRef = doc(db, 'news', editingArticle.id);
        await updateDoc(articleRef, articleData);
      } else {
        await addDoc(collection(db, 'news'), articleData);
      }

      await loadArticles();
      setIsDialogOpen(false);
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Error saving article:', error);
      setError('Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) {
      setError('Article not found');
      return;
    }

    if (!canEditArticle(article)) {
      setError('You can only delete your own articles');
      return;
    }

    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteDoc(doc(db, 'news', id));
        await loadArticles();
        setError(null);
      } catch (error) {
        console.error('Error deleting article:', error);
        setError('Failed to delete article');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const article = articles.find(a => a.id === id);
      if (article) {
        const articleRef = doc(db, 'news', id);
        const newStatus = article.status === 'published' ? 'draft' : 'published';
        await updateDoc(articleRef, {
          status: newStatus,
          updatedAt: new Date()
        });
        await loadArticles();
        setError(null);
      }
    } catch (error) {
      console.error('Error updating article status:', error);
      setError('Failed to update article status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">Create, edit, and manage news articles</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={loadArticles} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/">
                <Eye className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Site</span>
                <span className="sm:hidden">Site</span>
              </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Article</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingArticle ? 'Edit Article' : 'Add New Article'}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {editingArticle ? 'Update the article details' : 'Create a new news article'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Enter article title"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                      <Select
                        value={showCustomCategory ? 'other' : formData.category}
                        onValueChange={(value) => {
                          if (value === 'other') {
                            setShowCustomCategory(true);
                            setFormData({...formData, category: '', state: 'all'});
                          } else {
                            setShowCustomCategory(false);
                            setCustomCategory('');
                            setFormData({...formData, category: value, state: 'all'});
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other (Create New Category)</SelectItem>
                        </SelectContent>
                      </Select>

                      {showCustomCategory && (
                        <div className="space-y-2">
                          <Label htmlFor="customCategory" className="text-sm font-medium">New Category Name *</Label>
                          <Input
                            id="customCategory"
                            value={customCategory}
                            onChange={(e) => {
                              setCustomCategory(e.target.value);
                              setFormData({...formData, category: e.target.value});
                            }}
                            placeholder="Enter new category name (in English)"
                            required={showCustomCategory}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            Enter the category name in English. It will be automatically translated for the frontend.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* State selection - only show for National category */}
                    {formData.category === 'national' && (
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium">State (Optional)</Label>
                        <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select state (optional)" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All States</SelectItem>
                            {stateOptions.map((state) => (
                              <SelectItem key={state.code} value={state.code}>
                                {state.name} ({state.type === 'state' ? 'State' : 'UT'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select a specific state for state-specific news, or leave blank for general national news
                        </p>
                      </div>
                    )}

                    {/* Debug info - remove this after testing */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                        Debug: Category = "{formData.category}", Show state dropdown: {formData.category === 'national' ? 'YES' : 'NO'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="Brief description of the article"
                      rows={3}
                      required
                      className="w-full resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Full article content"
                      rows={8}
                      required
                      className="w-full resize-y min-h-[200px]"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-medium">Article Image *</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageFile" className="text-sm">Upload Image</Label>
                        <Input
                          id="imageFile"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-sm">Or Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          placeholder="https://ibb.co/abc123 or https://i.imgur.com/abc123.jpg"
                          className="w-full"
                          disabled={!!imageFile}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: ImageBB, Imgur, Google Drive, Dropbox, and direct image URLs
                        </p>
                        {formData.imageUrl && !imageFile && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Image Preview:</p>
                            {isValidImageUrl(formData.imageUrl) ? (
                              <img
                                src={getDirectImageUrl(formData.imageUrl)}
                                alt="Preview"
                                className="w-full max-w-xs h-32 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'text-red-500 text-xs';
                                  errorDiv.textContent = 'Invalid image URL or unable to load image';
                                  target.parentNode?.appendChild(errorDiv);
                                }}
                              />
                            ) : (
                              <div className="text-yellow-600 text-xs p-2 bg-yellow-50 rounded border">
                                ⚠️ URL doesn't appear to be a valid image. Supported: ImageBB, Imgur, Google Drive, Dropbox, and direct image URLs.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {uploadingImage && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Uploading image...</span>
                      </div>
                    )}

                    {imageFile && (
                      <div className="text-sm text-green-600">
                        Selected: {imageFile.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl" className="text-sm font-medium">Video URL (Optional)</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        placeholder="https://example.com/video.mp4"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">Add video URL if this article has an associated video</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-medium">Author *</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        placeholder="Author name"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Additional Images Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Additional Images (Optional)</Label>
                      <Button type="button" onClick={addAdditionalImage} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Image
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Add more images to display within the article content</p>

                    {formData.additionalImages.map((imageUrl, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            value={imageUrl}
                            onChange={(e) => updateAdditionalImage(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Related Links Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Related Links (Optional)</Label>
                      <Button type="button" onClick={addRelatedLink} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Link
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Add related links that readers can click to visit external resources</p>

                    {formData.relatedLinks.map((link, index) => (
                      <div key={link.id} className="space-y-2 p-3 border rounded bg-white">
                        <div className="flex gap-2 items-center">
                          <Input
                            value={link.title}
                            onChange={(e) => updateRelatedLink(index, 'title', e.target.value)}
                            placeholder="Link title"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => removeRelatedLink(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={link.url}
                          onChange={(e) => updateRelatedLink(index, 'url', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full"
                        />
                        <Input
                          value={link.description || ''}
                          onChange={(e) => updateRelatedLink(index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Separate tags with commas</p>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
                        />
                        <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                          Featured Article
                        </Label>
                        <span className="text-xs text-gray-500">
                          {formData.featured ? 'Will appear in featured section' : 'Regular article'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="latestNews"
                          checked={formData.latestNews}
                          onCheckedChange={(checked) => setFormData({...formData, latestNews: checked})}
                        />
                        <Label htmlFor="latestNews" className="text-sm font-medium cursor-pointer">
                          Latest News
                        </Label>
                        <span className="text-xs text-gray-500">
                          {formData.latestNews ? 'Will appear in latest news section' : 'Regular article'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={formData.status} onValueChange={(value: NewsArticle['status']) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingArticle ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {editingArticle ? 'Update' : 'Create'} Article
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Badge variant="outline" className="flex items-center justify-center p-2 text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Total: {stats.total}
          </Badge>
          <Badge variant="default" className="flex items-center justify-center p-2 text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Published: {stats.published}
          </Badge>
          <Badge variant="secondary" className="flex items-center justify-center p-2 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Draft: {stats.draft}
          </Badge>
          <Badge variant="destructive" className="flex items-center justify-center p-2 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Featured: {stats.featured}
          </Badge>
          <Badge variant="outline" className="flex items-center justify-center p-2 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Latest: {stats.latestNews}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search articles by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {currentUser?.role === 'editor' && (
                <div className="flex items-center space-x-2 px-3 py-2 border rounded-md">
                  <Switch
                    id="my-articles"
                    checked={showOnlyMyArticles}
                    onCheckedChange={setShowOnlyMyArticles}
                  />
                  <Label htmlFor="my-articles" className="text-sm font-medium">
                    My Articles Only
                  </Label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>Manage your news articles</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
              <TabsTrigger value="featured">Featured ({stats.featured})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No articles found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium line-clamp-1">{article.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryDisplayName(article.category, 'en')}</Badge>
                      </TableCell>
                      <TableCell>
                        {article.author}
                        {article.createdBy === currentUser?.id && (
                          <span className="ml-1 text-blue-600 font-medium text-xs">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={article.status === 'published' ? 'default' : article.status === 'draft' ? 'secondary' : 'destructive'}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(article.id)}
                        >
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{article.views || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="View Article"
                          >
                            <Link to={`/news/${article.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canEditArticle(article) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(article)}
                                title="Edit Article"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(article.id)}
                                title="Delete Article"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No articles found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Header with image and title */}
                    <div className="flex items-start space-x-3">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{article.excerpt}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{getCategoryDisplayName(article.category, 'en')}</Badge>
                      <Badge
                        variant={article.status === 'published' ? 'default' : article.status === 'draft' ? 'secondary' : 'destructive'}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(article.id)}
                      >
                        {article.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        by {article.author}
                        {article.createdBy === currentUser?.id && (
                          <span className="ml-1 text-blue-600 font-medium">(You)</span>
                        )}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{article.views || 0}</div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">Created</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 touch-target"
                      >
                        <Link to={`/news/${article.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {canEditArticle(article) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(article)}
                            className="flex-1 touch-target"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(article.id)}
                            className="touch-target text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManagementPage;
