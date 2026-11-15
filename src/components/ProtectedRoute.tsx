import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useAuth } from '../contexts/AuthContext';
import type { Permission } from '../auth/permissions';

interface ProtectedRouteProps {
  /** Se omitido, basta estar autenticado. */
  permission?: Permission;
}

export default function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { isAuthenticated, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !can(permission)) {
    return (
      <div role="alert" className="flex flex-col items-start gap-1 p-2">
        <Typography variant="h6">Acesso negado</Typography>
        <Typography color="text.secondary">
          Seu cargo não tem permissão para acessar esta área. Fale com um supervisor se precisar de acesso.
        </Typography>
      </div>
    );
  }

  return <Outlet />;
}
