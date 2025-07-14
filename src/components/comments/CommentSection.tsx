import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Comment } from '@/types';

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });

  // Load comments function
  const loadComments = async () => {
    try {
      console.log('Loading comments for article:', articleId);

      // Try without orderBy first to avoid index issues
      const commentsQuery = query(
        collection(db, 'comments'),
        where('articleId', '==', articleId),
        where('approved', '==', true)
      );

      const querySnapshot = await getDocs(commentsQuery);
      console.log('Found comments:', querySnapshot.size);

      const commentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Comment data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }) as Comment[];

      // Sort manually by createdAt descending
      commentsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('Processed comments:', commentsData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      console.error('Error details:', error.message);

      // If there's an index error, try a simpler query
      if (error.message?.includes('index')) {
        try {
          console.log('Trying fallback query without where clauses...');
          const allCommentsQuery = query(collection(db, 'comments'));
          const querySnapshot = await getDocs(allCommentsQuery);

          const commentsData = querySnapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date()
              };
            })
            .filter(comment => comment.articleId === articleId && comment.approved === true) as Comment[];

          commentsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setComments(commentsData);
          console.log('Fallback query successful:', commentsData);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load comments for this article
  useEffect(() => {
    loadComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        articleId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        comment: formData.comment.trim(),
        createdAt: new Date(),
        approved: true // Auto-approve comments for now
      };

      console.log('Submitting comment:', commentData);
      const docRef = await addDoc(collection(db, 'comments'), commentData);
      console.log('Comment submitted with ID:', docRef.id);

      // Add the new comment to the state immediately for instant display
      const newComment: Comment = {
        id: docRef.id,
        ...commentData
      };
      setComments(prevComments => [newComment, ...prevComments]);

      // Reset form
      setFormData({ name: '', email: '', comment: '' });

      alert('Your comment has been posted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      console.error('Error details:', error.message);
      alert(`Failed to submit comment: ${error.message}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Leave a Comment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
                <p className="text-xs text-gray-500">Your email will not be published</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment *</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Write your comment here..."
                rows={4}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(comment.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{comment.name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
