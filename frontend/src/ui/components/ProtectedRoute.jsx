import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();


  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 className="spinner" size={40} />
        <p>Verifying Neural Signature...</p>
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  return <Outlet />;
};

export default ProtectedRoute;