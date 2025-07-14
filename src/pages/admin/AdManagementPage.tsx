import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
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
import { Plus, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Advertisement } from '@/types';

const AdManagementPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDemo, setCreatingDemo] = useState(false);

  // Load advertisements from Firebase
  const loadAds = async () => {
    try {
      setLoading(true);
      console.log('Loading ads...');
      const q = query(collection(db, 'advertisements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log('Ads query result:', querySnapshot.size, 'documents');
      const adsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
      })) as Advertisement[];
      setAds(adsData);
      console.log('Loaded ads:', adsData.length);
    } catch (error) {
      console.error('Error loading advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
    console.log('AdManagementPage loaded, current user:', currentUser);
  }, [currentUser]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'header' as Advertisement['position'],
    category: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!currentUser) {
      alert('You must be logged in to create advertisements');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.imageUrl || !formData.linkUrl || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate >= endDate) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const adData: any = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        position: formData.position,
        isActive: formData.isActive,
        startDate: startDate,
        endDate: endDate,
        updatedAt: new Date(),
        ...(editingAd ? {} : {
          createdAt: new Date(),
          clickCount: 0,
          impressionCount: 0
        })
      };

      // Only add category if it has a value
      if (formData.category && formData.category.trim()) {
        adData.category = formData.category.trim();
      }

      console.log('Saving ad data:', adData);
      console.log('Current user:', currentUser);

      if (editingAd) {
        const adRef = doc(db, 'advertisements', editingAd.id);
        await updateDoc(adRef, adData);
        console.log('Advertisement updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'advertisements'), adData);
        console.log('Advertisement created successfully with ID:', docRef.id);
      }

      await loadAds();
      resetForm();
      setIsDialogOpen(false);
      alert(editingAd ? 'Advertisement updated successfully!' : 'Advertisement created successfully!');
    } catch (error: any) {
      console.error('Error saving advertisement:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorMessage = 'Error saving advertisement. Please try again.';

      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication and try again.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'You are not authenticated. Please log in and try again.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      position: 'header',
      category: '',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingAd(null);
    setIsSubmitting(false);
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      position: ad.position,
      category: ad.category || '',
      isActive: ad.isActive,
      startDate: ad.startDate.toISOString().split('T')[0],
      endDate: ad.endDate.toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await deleteDoc(doc(db, 'advertisements', id));
        await loadAds();
      } catch (error) {
        console.error('Error deleting advertisement:', error);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const ad = ads.find(a => a.id === id);
      if (ad) {
        const adRef = doc(db, 'advertisements', id);
        await updateDoc(adRef, {
          isActive: !ad.isActive,
          updatedAt: new Date()
        });
        await loadAds();
      }
    } catch (error) {
      console.error('Error updating advertisement status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-600">Manage advertisements displayed on your site</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
              </DialogTitle>
              <DialogDescription>
                {editingAd ? 'Update the advertisement details' : 'Create a new advertisement for your site'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value as Advertisement['position']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header (Recommended: 1200x300px - Wide banner)</SelectItem>
                      <SelectItem value="top">Top (Recommended: 900x250px - Medium banner)</SelectItem>
                      <SelectItem value="sidebar">Sidebar (Recommended: 300x400px - Square/tall)</SelectItem>
                      <SelectItem value="content">Content (Recommended: 800x200px - Medium banner)</SelectItem>
                      <SelectItem value="footer">Footer (Recommended: 1200x250px - Wide banner)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.position === 'header' && '💡 Header ads appear at the top of pages - use wide banner format'}
                    {formData.position === 'top' && '💡 Top ads appear below header - use medium banner format'}
                    {formData.position === 'sidebar' && '💡 Sidebar ads appear on the right side - use square/tall format'}
                    {formData.position === 'content' && '💡 Content ads appear between articles - use medium banner format'}
                    {formData.position === 'footer' && '💡 Footer ads appear at the bottom - use wide banner format'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Leave empty for all categories"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisements</CardTitle>
          <CardDescription>Manage your site advertisements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading advertisements...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No advertisements found. Create your first ad!</p>
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.linkUrl}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ad.position}
                    </Badge>
                  </TableCell>
                  <TableCell>{ad.category || 'All'}</TableCell>
                  <TableCell>
                    <Badge variant={ad.isActive ? 'default' : 'secondary'}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{ad.impressionCount} views</div>
                      <div>{ad.clickCount} clicks</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(ad.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdManagementPage;
