import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import './i18n'; // Initialize i18n
import './utils/bfcache'; // Initialize BFCache optimization

// Pages
import Index from './pages/Index';
import NewsDetail from './pages/NewsDetail';
import CategoryPage from './pages/CategoryPage';
import StateCategoryPage from './pages/StateCategoryPage';
import AboutPage from './pages/AboutPage';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdManagementPage from './pages/admin/AdManagementPage';
import NewsManagementPage from './pages/admin/NewsManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';



import CreateAccountPage from './pages/admin/CreateAccountPage';
import UnauthorizedPage from './pages/admin/UnauthorizedPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/latest" element={<CategoryPage />} />
              <Route path="/national" element={<StateCategoryPage />} />
              <Route path="/national/:state" element={<StateCategoryPage />} />
              <Route path="/international" element={<CategoryPage />} />
              <Route path="/politics" element={<CategoryPage />} />
              <Route path="/sports" element={<CategoryPage />} />
              <Route path="/entertainment" element={<CategoryPage />} />
              <Route path="/technology" element={<CategoryPage />} />
              <Route path="/business" element={<CategoryPage />} />
              <Route path="/special-reports" element={<CategoryPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />

              {/* Admin Authentication Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/create-accounts" element={<CreateAccountPage />} />
              <Route path="/admin/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="news" element={
                  <ProtectedRoute requireEditor>
                    <NewsManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="ads" element={
                  <ProtectedRoute requireEditor>
                    <AdManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute requireAdmin>
                    <UserManagementPage />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
