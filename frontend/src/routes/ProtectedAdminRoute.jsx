import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16171d] text-white flex items-center justify-center text-xs font-mono">
        Verifying administrator authorization...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Check admin role authorization
  const allowedRoles = ['ADMIN', 'STAFF', 'SUPER_ADMIN'];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#fdf9f2] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1c1c18]">Access Restricted</h2>
        <p className="text-xs text-[#645d56] max-w-md">
          Your account (<strong>{user?.email}</strong>) does not have administrator permissions to access the internal Om Shilpi Jewels management portal.
        </p>
        <a
          href="/"
          className="bg-[#7b5818] text-white text-xs font-semibold px-6 py-2.5 rounded uppercase tracking-wider"
        >
          Return to Customer Storefront
        </a>
      </div>
    );
  }

  return children;
};
