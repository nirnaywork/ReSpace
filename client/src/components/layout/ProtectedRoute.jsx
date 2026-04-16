import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-red border-t-transparent animate-spin" />
          <p className="text-brand-muted text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && userProfile && !userProfile.roles?.includes(requiredRole)) {
    if (requiredRole === 'owner') {
      return <Navigate to="/owner/add-space" replace />;
    }
    return <Navigate to="/listings" replace />;
  }

  return children;
};

export default ProtectedRoute;
