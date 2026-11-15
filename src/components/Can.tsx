import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Permission } from '../auth/permissions';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renderiza os filhos apenas se o cargo do usuário tiver a permissão. */
export default function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}
