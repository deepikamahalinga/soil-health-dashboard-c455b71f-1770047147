import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assume this hook exists

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectPath?: string;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectPath = '/login'
}: ProtectedRouteProps): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page but save the attempted URL
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // If authenticated or no auth required, render children
  return <>{children}</>;
};