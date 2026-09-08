import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'admin' | 'buyer' | 'vendor'>;
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps): ReactElement {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
