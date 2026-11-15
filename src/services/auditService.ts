
import { api } from './api';
import type { AuditLog, AuditQuery, Paginated } from '../types';

interface AuditApiLog {
  id: string;
  userId: string | null;
  userName: string | null;
  role: string | null;
  sourceIp: string | null;
  dateTime: string;
  action: AuditLog['action'];
  affectedEntity: string;
  affectedRecordId: string;
  previousData: AuditLog['oldValues'];
  newData: AuditLog['newValues'];
}

interface AuditApiResponse {
  auditLogs: AuditApiLog[];
  total?: number;
  page?: number;
  pageSize?: number;
}

const resourceMap: Record<string, AuditLog['resource']> = {
  maquina: 'Machine',
  ordem_producao: 'ProductionOrder',
  usuario: 'User',
  Machine: 'Machine',
  ProductionOrder: 'ProductionOrder',
  User: 'User',
};

export const auditService = {
  async list(query: AuditQuery): Promise<Paginated<AuditLog>> {
    const { data } = await api.get<AuditApiResponse>(
      '/audit-logs',
      { params: query }
    );

    const logs: AuditLog[] = (data.auditLogs ?? []).map((log) => ({
      id: log.id,
      resource: resourceMap[log.affectedEntity] ?? 'ProductionOrder',
      resourceId: log.affectedRecordId,
      action: log.action,
      oldValues: log.previousData,
      newValues: log.newData,
      ipAddress: log.sourceIp ?? '',
      createdAt: log.dateTime,
      user: {
        id: log.userId ?? '',
        name: log.userName ?? 'Usuário não identificado',
        email: '',
        role: (log.role ?? 'AUDITOR') as AuditLog['user']['role'],
      },
    }));

    return {
      data: logs,
      total: data.total ?? logs.length,
      page: data.page ?? query.page,
      pageSize: data.pageSize ?? query.pageSize,
    };
  },
};
