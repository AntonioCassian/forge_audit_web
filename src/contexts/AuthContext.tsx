// import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { authService } from '../services/authService';
// import { setUnauthorizedHandler, tokenStorage, USER_KEY } from '../services/api';
// import { useIdleTimer } from '../hooks/useIdleTimer';
// import { hasPermission, Permission } from '../auth/permissions';
// import type { Role, User } from '../types';

// export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos (requisito de sistema regulado)

// export type LogoutReason = 'manual' | 'idle' | 'expired';

// interface AuthContextValue {
//   user: User | null;
//   role: Role | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: (reason?: LogoutReason) => void;
//   hasRole: (...roles: Role[]) => boolean;
//   can: (permission: Permission) => boolean;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// const readStoredUser = (): User | null => {
//   try {
//     const raw = sessionStorage.getItem(USER_KEY);
//     return raw && tokenStorage.get() ? (JSON.parse(raw) as User) : null;
//   } catch {
//     return null;
//   }
// };

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(readStoredUser);

//   const logout = useCallback(
//     (reason: LogoutReason = 'manual') => {
//       tokenStorage.clear();
//       setUser(null);
//       navigate(reason === 'manual' ? '/login' : `/login?reason=${reason}`, { replace: true });
//     },
//     [navigate],
//   );

//   const login = useCallback(async (email: string, password: string) => {
//     const { token, user: loggedUser } = await authService.login(email, password);
//     tokenStorage.set(token);
//     sessionStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
//     setUser(loggedUser);
//   }, []);

//   const role = user?.role ?? null;
//   const hasRole = useCallback((...roles: Role[]) => !!role && roles.includes(role), [role]);
//   const can = useCallback((permission: Permission) => hasPermission(role, permission), [role]);

//   // 401 vindo de qualquer chamada → encerra a sessão pelo mesmo caminho do logout.
//   useEffect(() => {
//     setUnauthorizedHandler(() => logout('expired'));
//     return () => setUnauthorizedHandler(null);
//   }, [logout]);

//   // Logout automático após 5 minutos sem interação (só roda com usuário logado).
//   useIdleTimer({
//     timeoutMs: IDLE_TIMEOUT_MS,
//     enabled: !!user,
//     onIdle: () => logout('idle'),
//   });

//   const value = useMemo<AuthContextValue>(
//     () => ({ user, role, isAuthenticated: !!user, login, logout, hasRole, can }),
//     [user, role, login, logout, hasRole, can],
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth(): AuthContextValue {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
//   return ctx;
// }



import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  setUnauthorizedHandler,
  tokenStorage,
  USER_KEY,
} from '../services/api';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { hasPermission, Permission } from '../auth/permissions';
import type { Role, User } from '../types';

export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

// Motivos de encerramento da sessão
export type LogoutReason = 'manual' | 'idle' | 'expired';

// Interface do contexto
interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: LogoutReason) => void;
  hasRole: (...roles: Role[]) => boolean;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Define a página inicial conforme o cargo
const getRoleHomeRoute = (role: Role): string => {
  switch (role) {
    case 'OPERATOR':
      return '/machines';

    case 'SUPERVISOR':
      return '/machines';

    case 'AUDITOR':
      return '/audit';

    default:
      return '/login';
  }
};

// Recupera o usuário armazenado na sessão
const readStoredUser = (): User | null => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);

    return raw && tokenStorage.get()
      ? (JSON.parse(raw) as User)
      : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(readStoredUser);

  // Encerramento da sessão
  const logout = useCallback(
    (reason: LogoutReason = 'manual') => {
      tokenStorage.clear();
      sessionStorage.removeItem(USER_KEY);

      setUser(null);

      navigate(
        reason === 'manual'
          ? '/login'
          : `/login?reason=${reason}`,
        { replace: true },
      );
    },
    [navigate],
  );

  // Autenticação
  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: loggedUser } =
        await authService.login(email, password);

      tokenStorage.set(token);

      sessionStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedUser),
      );

      setUser(loggedUser);

      // Redireciona conforme o cargo
      navigate(getRoleHomeRoute(loggedUser.role), {
        replace: true,
      });
    },
    [navigate],
  );

  // Cargo atual
  const role = user?.role ?? null;

  // Verifica cargos
  const hasRole = useCallback(
    (...roles: Role[]) => !!role && roles.includes(role),
    [role],
  );

  // Verifica permissões
  const can = useCallback(
    (permission: Permission) =>
      hasPermission(role, permission),
    [role],
  );

  // Qualquer resposta 401 encerra a sessão
  useEffect(() => {
    setUnauthorizedHandler(() => logout('expired'));

    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Logout automático após 5 minutos sem interação
  useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    enabled: !!user,
    onIdle: () => logout('idle'),
  });

  // Valor disponibilizado pelo contexto
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
      can,
    }),
    [user, role, login, logout, hasRole, can],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de autenticação
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth deve ser usado dentro de <AuthProvider>.',
    );
  }

  return ctx;
}
