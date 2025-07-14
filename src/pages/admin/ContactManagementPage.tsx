import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  MessageSquare, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Building
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContactSubmission } from '@/types';
import { format } from 'date-fns';

const ContactManagementPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'contacts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData: ContactSubmission[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ContactSubmission);
      });
      setContacts(contactsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateContactStatus = async (contactId: string, status: ContactSubmission['status'], notes?: string) => {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      if (notes !== undefined) {
        updateData.adminNotes = notes;
      }
      
      await updateDoc(contactRef, updateData);
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact status');
    }
  };

  const getStatusBadge = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'replied':
        return <Badge variant="default">Replied</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-700">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: ContactSubmission['type']) => {
    const typeLabels = {
      'general': 'सामान्य',
      'news-tip': 'न्यूज़ टिप',
      'feedback': 'फीडबैक',
      'advertising': 'विज्ञापन',
      'partnership': 'पार्टनरशिप',
      'technical': 'तकनीकी'
    };
    
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
    resolved: contacts.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Contact Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage contact form submissions and inquiries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-red-600">{stats.new}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Read</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replied</p>
                <p className="text-2xl font-bold text-blue-600">{stats.replied}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">सामान्य</SelectItem>
                <SelectItem value="news-tip">न्यूज़ टिप</SelectItem>
                <SelectItem value="feedback">फीडबैक</SelectItem>
                <SelectItem value="advertising">विज्ञापन</SelectItem>
                <SelectItem value="partnership">पार्टनरशिप</SelectItem>
                <SelectItem value="technical">तकनीकी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No contacts found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {contact.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={contact.subject}>
                          {contact.subject}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(contact.type)}</TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(contact.createdAt, 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setAdminNotes(contact.adminNotes || '');
                                if (contact.status === 'new') {
                                  updateContactStatus(contact.id, 'read');
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Contact Details</DialogTitle>
                            </DialogHeader>
                            {selectedContact && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Name</Label>
                                    <p className="font-medium">{selectedContact.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selectedContact.email}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Subject</Label>
                                  <p className="font-medium">{selectedContact.subject}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Type</Label>
                                    <div className="mt-1">{getTypeBadge(selectedContact.type)}</div>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Message</Label>
                                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Date Submitted</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {format(selectedContact.createdAt, 'PPpp')}
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="adminNotes">Admin Notes</Label>
                                  <Textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Select
                                    value={selectedContact.status}
                                    onValueChange={(value) => updateContactStatus(selectedContact.id, value as ContactSubmission['status'], adminNotes)}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="read">Read</SelectItem>
                                      <SelectItem value="replied">Replied</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button
                                    onClick={() => updateContactStatus(selectedContact.id, selectedContact.status, adminNotes)}
                                    variant="outline"
                                  >
                                    Save Notes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManagementPage;
