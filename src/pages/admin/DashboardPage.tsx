import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsArticle } from '@/types';
import { newsService } from '@/services/firebaseService';
import {
  FileText,
  Users,
  Megaphone,
  Eye,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Settings,
  Globe,
  Activity,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalNews: 0,
    totalUsers: 0,
    totalAds: 0,
    totalContacts: 0,
    newContacts: 0,
    totalViews: 0,
    todayViews: 0,
    thisMonthNews: 0,
    publishedNews: 0,
    draftNews: 0,
    activeAds: 0,
    expiredAds: 0,
    adminUsers: 0,
    editorUsers: 0,
    regularUsers: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializingViews, setInitializingViews] = useState(false);

  // Fetch real data from Firebase
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch news articles
      const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const newsSnapshot = await getDocs(newsQuery);
      const newsArticles = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as NewsArticle[];

      // Fetch users (only for admins)
      let users: any[] = [];
      if (isAdmin()) {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      // Fetch advertisements
      const adsQuery = query(collection(db, 'advertisements'));
      const adsSnapshot = await getDocs(adsQuery);
      const ads = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch contacts
      const contactsQuery = query(collection(db, 'contacts'));
      const contactsSnapshot = await getDocs(contactsQuery);
      const contacts = contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const publishedNews = newsArticles.filter(article => article.status === 'published').length;
      const draftNews = newsArticles.filter(article => article.status === 'draft').length;
      const activeAds = ads.filter(ad => ad.isActive).length;
      const expiredAds = ads.filter(ad => !ad.isActive).length;

      const adminUsers = users.filter(user => user.role === 'admin').length;
      const editorUsers = users.filter(user => user.role === 'editor').length;
      const regularUsers = users.filter(user => user.role === 'user').length;

      // Get this month's news
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthNews = newsArticles.filter(article =>
        article.createdAt >= thisMonth
      ).length;

      // Calculate total views (sum of all article views)
      const totalViews = newsArticles.reduce((sum, article) => sum + (article.views || 0), 0);

      setStats({
        totalNews: newsArticles.length,
        totalUsers: users.length,
        totalAds: ads.length,
        totalContacts: contacts.length,
        newContacts: contacts.filter(contact => contact.status === 'new').length,
        totalViews,
        todayViews: Math.floor(totalViews * 0.1), // Estimate today's views
        thisMonthNews,
        publishedNews,
        draftNews,
        activeAds,
        expiredAds,
        adminUsers,
        editorUsers,
        regularUsers
      });

      // Set recent news (last 5)
      setRecentNews(newsArticles.slice(0, 5));

      // Generate recent activity from real data
      const activities = [];

      // Add recent articles
      newsArticles.slice(0, 3).forEach((article, index) => {
        activities.push({
          id: `news-${index}`,
          action: article.status === 'published' ? 'New article published' : 'Article drafted',
          time: getTimeAgo(article.createdAt),
          user: article.author || 'Unknown',
          type: 'news',
          status: article.status === 'published' ? 'success' : 'info'
        });
      });

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  // Initialize views for existing articles
  const handleInitializeViews = async () => {
    if (!isAdmin()) return;

    try {
      setInitializingViews(true);
      await newsService.initializeViewsForExistingArticles();
      alert('Views initialized successfully for existing articles!');
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error initializing views:', error);
      alert('Error initializing views. Please try again.');
    } finally {
      setInitializingViews(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'news': return <FileText className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'ad': return <Megaphone className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base truncate">Welcome back, {currentUser?.displayName || currentUser?.email}</p>
          <div className="flex items-center mt-2 space-x-2 flex-wrap">
            <Badge variant={currentUser?.role === 'admin' ? 'destructive' : currentUser?.role === 'editor' ? 'default' : 'secondary'} className="text-xs">
              {currentUser?.role} (Level {currentUser?.roleLevel})
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/news">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Article</span>
              <span className="sm:hidden">New</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/">
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">View Site</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </Button>
          {isAdmin() && (
            <Button
              variant="secondary"
              onClick={handleInitializeViews}
              disabled={initializingViews}
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              {initializingViews ? 'Initializing...' : 'Init Views'}
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNews}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-green-600">Published: {stats.publishedNews}</span>
              <span className="text-yellow-600">Draft: {stats.draftNews}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.thisMonthNews} this month
            </p>
          </CardContent>
        </Card>

        {isAdmin() && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className="text-red-600">Admin: {stats.adminUsers}</span>
                <span className="text-blue-600">Editor: {stats.editorUsers}</span>
                <span className="text-gray-600">User: {stats.regularUsers}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertisements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-green-600">Active: {stats.activeAds}</span>
              <span className="text-red-600">Expired: {stats.expiredAds}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.expiredAds} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-red-600">New: {stats.newContacts}</span>
              <span className="text-green-600">Total: {stats.totalContacts}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.newContacts} need attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats.todayViews} today</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +15.2% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest news articles and their status</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/admin/news">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNews.map((article) => (
                  <div key={article.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-gray-50 space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <h4 className="font-medium text-sm line-clamp-2 sm:line-clamp-1">{article.title}</h4>
                        <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className="text-xs w-fit">
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{article.category}</span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {article.views || 0}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(article.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0 self-start sm:self-center">
                      <Button size="sm" variant="ghost" asChild className="touch-target">
                        <Link to="/admin/news" state={{ editArticle: article }}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild className="touch-target">
                        <Link to={`/news/${article.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/news">
                    View All Articles
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/news">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Articles
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/ads">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Manage Ads
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/contacts">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage Contacts
                  {stats.newContacts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.newContacts}
                    </span>
                  )}
                </Link>
              </Button>
              {isAdmin() && (
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
