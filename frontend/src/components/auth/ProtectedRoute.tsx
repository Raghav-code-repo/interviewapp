import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  /** When set, the user must hold this role to view the route. */
  requireRole?: string;
}

/**
 * Blocks a route until the stored JWT has been verified against /auth/me.
 *
 * While `status === 'loading'` it renders a neutral placeholder instead of
 * redirecting, otherwise a page refresh on a deep link would bounce an
 * authenticated user to /login before the session check had completed.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-500/10">
        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-medium">Restoring your session...</span>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    // Preserve the intended destination so the user lands where they meant to go.
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
