import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { galleryService } from '@/services/firebaseService';
import { GalleryImage } from '@/types';
import { useFirebaseCRUD } from '@/hooks/useFirebaseData';
import { toast } from 'sonner';

export default function GalleryManagementPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { loading: crudLoading, error, createImage, updateImage, deleteImage } = useFirebaseCRUD();
  
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: ''
  });

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAllImages();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      toast.error('गैलरी लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl || !formData.caption) {
      toast.error('कृपया सभी फ़ील्ड भरें');
      return;
    }

    try {
      if (editingId) {
        await updateImage(editingId, formData);
        toast.success('इमेज अपडेट हो गई');
        setEditingId(null);
      } else {
        await createImage(formData);
        toast.success('इमेज जोड़ी गई');
        setShowAddForm(false);
      }
      
      // Reset form
      setFormData({
        imageUrl: '',
        caption: ''
      });
      
      // Refresh images
      fetchImages();
    } catch (err) {
      console.error('Error saving image:', err);
      toast.error('इमेज सेव करने में त्रुटि');
    }
  };

  // Handle edit
  const handleEdit = (image: GalleryImage) => {
    setFormData({
      imageUrl: image.imageUrl,
      caption: image.caption
    });
    setEditingId(image.id);
    setShowAddForm(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप वाकई इस इमेज को हटाना चाहते हैं?')) return;
    
    try {
      await deleteImage(id);
      toast.success('इमेज हटा दी गई');
      fetchImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('इमेज हटाने में त्रुटि');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      imageUrl: '',
      caption: ''
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">गैलरी लोड हो रही है...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">गैलरी प्रबंधन</h1>
            <p className="text-muted-foreground">फोटो गैलरी जोड़ें, संपादित करें और प्रबंधित करें</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || editingId !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            नई इमेज जोड़ें
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'इमेज संपादित करें' : 'नई इमेज जोड़ें'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">इमेज URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="caption">कैप्शन *</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="इमेज का विवरण"
                    required
                  />
                </div>

                {/* Preview */}
                {formData.imageUrl && (
                  <div>
                    <Label>प्रीव्यू</Label>
                    <div className="mt-2 border rounded-lg p-4">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {formData.caption && (
                        <p className="mt-2 text-sm text-muted-foreground">{formData.caption}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={crudLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'अपडेट करें' : 'जोड़ें'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    रद्द करें
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm mb-4 line-clamp-3">{image.caption}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(image)}
                    disabled={editingId !== null || showAddForm}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id)}
                    disabled={crudLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">कोई इमेज नहीं मिली</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
