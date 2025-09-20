import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from 'src/utils/authService';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) {
      // Limpiar cualquier token residual
      localStorage.removeItem('token');
    }
  }, [authenticated]);

  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
