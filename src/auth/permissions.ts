import type { Role } from '../types';

export type Permission =
  | 'machines:view'
  | 'machines:create'
  | 'machines:updateStatus'
  | 'orders:view'
  | 'orders:create'
  | 'orders:operate' // iniciar, suspender, concluir e atualizar quantidade produzida
  | 'users:manage'
  | 'audit:view';

export const ROLE_LABEL: Record<Role, string> = {
  OPERATOR: 'Operador',
  SUPERVISOR: 'Supervisor',
  AUDITOR: 'Auditor',
};

/** Matriz única de permissões: menus, rotas e botões consultam apenas este mapa. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OPERATOR: ['machines:view', 'machines:updateStatus', 'orders:view', 'orders:operate'],
  SUPERVISOR: [
    'machines:view',
    'machines:create',
    'machines:updateStatus',
    'orders:view',
    'orders:create',
    'orders:operate',
    'users:manage',
    'audit:view',
  ],
  AUDITOR: ['machines:view', 'orders:view', 'audit:view'], // somente leitura
};

export const hasPermission = (role: Role | null | undefined, permission: Permission): boolean =>
  !!role && ROLE_PERMISSIONS[role].includes(permission);
