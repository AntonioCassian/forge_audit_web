export type Role = 'OPERATOR' | 'SUPERVISOR' | 'AUDITOR';
export type MachineStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'STOPPED_DUE_TO_FAILURE';
export type OrderStatus = 'PLANNED' | 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED';
export type AuditResource = 'User' | 'Machine' | 'ProductionOrder';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  assetCode: string; // código de patrimônio
  status: MachineStatus;
  updatedAt: string;
}

export interface ProductionOrder {
  machineName: ReactNode;
  id: string;
  productionCode: string; // lote
  machineId: string;
  machine?: Pick<Machine, 'id' | 'name' | 'assetCode'>;
  plannedQuantity: number;
  producedQuantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}


export interface AuditLog {
  id: string;
  resource: AuditResource;
  resourceId: string;
  action: AuditAction;
  oldValues: JsonObject | null;
  newValues: JsonObject | null;
  ipAddress: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuditQuery {
  page: number; // 1-based
  pageSize: number;
  resource?: AuditResource;
  dateFrom?: string; // ISO yyyy-MM-dd
  dateTo?: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface CreateMachineDTO {
  name: string;
  assetCode: string;
  status: MachineStatus;
}

export interface CreateProductionOrderDTO {
  productionCode: string;
  machineId: string;
  plannedQuantity: number;
}

export const ROLES: readonly Role[] = ['OPERATOR', 'SUPERVISOR', 'AUDITOR'];
export const MACHINE_STATUSES: readonly MachineStatus[] = ['OPERATIONAL', 'MAINTENANCE', 'STOPPED_DUE_TO_FAILURE'];
export const AUDIT_RESOURCES: readonly AuditResource[] = ['Machine', 'ProductionOrder', 'User'];
