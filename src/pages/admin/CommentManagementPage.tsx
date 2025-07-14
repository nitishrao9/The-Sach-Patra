import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Trash2, 
  MessageSquare, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Comment } from '@/types';

export default function CommentManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsQuery = query(
        collection(db, 'comments'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Comment[];
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleApprove = async (commentId: string) => {
    setProcessing(commentId);
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, { approved: true });
      await loadComments();
    } catch (error) {
      console.error('Error approving comment:', error);
      alert('Failed to approve comment');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (commentId: string) => {
    setProcessing(commentId);
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, { approved: false });
      await loadComments();
    } catch (error) {
      console.error('Error rejecting comment:', error);
      alert('Failed to reject comment');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setProcessing(commentId);
    try {
      const commentRef = doc(db, 'comments', commentId);
      await deleteDoc(commentRef);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const pendingComments = comments.filter(comment => !comment.approved);
  const approvedComments = comments.filter(comment => comment.approved);

  const CommentTable = ({ comments, showApprovalActions = false }: { comments: Comment[], showApprovalActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Comment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.map((comment) => (
          <TableRow key={comment.id}>
            <TableCell className="font-medium">{comment.name}</TableCell>
            <TableCell className="text-sm text-gray-600">{comment.email}</TableCell>
            <TableCell className="max-w-xs">
              <p className="truncate" title={comment.comment}>
                {comment.comment}
              </p>
            </TableCell>
            <TableCell className="text-sm">{formatDate(comment.createdAt)}</TableCell>
            <TableCell>
              {comment.approved ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {showApprovalActions && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(comment.id)}
                      disabled={processing === comment.id}
                      className="text-green-600 hover:text-green-700"
                    >
                      {processing === comment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(comment.id)}
                      disabled={processing === comment.id}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      {processing === comment.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
                {!showApprovalActions && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(comment.id)}
                    disabled={processing === comment.id}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    {processing === comment.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(comment.id)}
                  disabled={processing === comment.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {processing === comment.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comment Management</h1>
          <p className="text-gray-600">Manage and moderate user comments</p>
        </div>
        <Button onClick={loadComments} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingComments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedComments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingComments.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Comments</CardTitle>
              <CardDescription>
                Comments waiting for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingComments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending comments</p>
                </div>
              ) : (
                <CommentTable comments={pendingComments} showApprovalActions={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Comments</CardTitle>
              <CardDescription>
                Comments that are visible on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedComments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No approved comments</p>
                </div>
              ) : (
                <CommentTable comments={approvedComments} showApprovalActions={false} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
