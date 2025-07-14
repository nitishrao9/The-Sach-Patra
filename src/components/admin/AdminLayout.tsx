import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Megaphone,
  Globe,
  Shield,
  Home,
  Plus,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      permission: 'read'
    },
    {
      name: 'News Management',
      href: '/admin/news',
      icon: FileText,
      permission: 'write'
    },
    {
      name: 'Advertisement Management',
      href: '/admin/ads',
      icon: Megaphone,
      permission: 'write'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      permission: 'admin'
    }
  ];

  const hasPermission = (permission: string) => {
    switch (permission) {
      case 'read':
        return true;
      case 'write':
        return currentUser?.role === 'editor' || currentUser?.role === 'admin';
      case 'admin':
        return currentUser?.role === 'admin';
      default:
        return false;
    }
  };

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary to-primary/90">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">News Admin</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20 h-10 w-10 p-0 transition-colors touch-target flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {currentUser?.displayName || currentUser?.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                  currentUser?.role === 'admin'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : currentUser?.role === 'editor'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {currentUser?.role}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Level {currentUser?.roleLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="space-y-2">
            <Button asChild size="sm" className="w-full justify-start bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm transition-all duration-200 hover:shadow-md touch-target min-h-[44px]">
              <Link to="/admin/news">
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full justify-start border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors touch-target min-h-[44px]">
              <Link to="/">
                <Globe className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
          </div>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 mb-3 sm:mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigation</p>
          </div>

          <ul className="space-y-1 px-2 sm:px-3">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href !== '/admin' && location.pathname.startsWith(item.href));

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-target group relative min-h-[44px]",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary active:bg-gray-200 dark:active:bg-gray-700"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200",
                      isActive ? "text-white" : "group-hover:scale-110"
                    )} />
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full opacity-80"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors touch-target min-h-[44px]"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 p-0 touch-target hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 min-w-0">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Home className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="flex-shrink-0 font-medium">Admin Panel</span>
                <span className="text-gray-400 flex-shrink-0">/</span>
                <span className="capitalize truncate text-primary font-medium">{location.pathname.split('/').pop() || 'dashboard'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Button asChild variant="ghost" size="sm" className="h-10 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-target">
              <Link to="/" className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">View Site</span>
              </Link>
            </Button>

            <div className="h-4 sm:h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                  <span className="text-white font-semibold text-xs">
                    {(currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
