import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEditor?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireEditor = false 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  if (requireEditor && !['admin', 'editor'].includes(currentUser.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};
