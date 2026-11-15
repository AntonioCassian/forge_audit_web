import { api } from './api';
import type { CreateProductionOrderDTO, OrderStatus, ProductionOrder } from '../types';

export const productionOrderService = {
  async list(): Promise<ProductionOrder[]> {
    const { data } = await api.get<ProductionOrder[]>('/production-orders');
    return data;
  },
  async create(payload: CreateProductionOrderDTO): Promise<ProductionOrder> {
    const { data } = await api.post<ProductionOrder>('/production-orders', payload);
    return data;
  },
  /** Iniciar/retomar → IN_PROGRESS, suspender → SUSPENDED, concluir → COMPLETED. */
  // async updateStatus(id: string, status: OrderStatus): Promise<ProductionOrder> {
  //   const { data } = await api.put<ProductionOrder>(`/production-orders/${id}`, { status });
  //   return data;
  // },
  async updateStatus(machineId: string, status: OrderStatus): Promise<ProductionOrder> {
    const { data } = await api.patch<ProductionOrder>(`/production-orders/${machineId}/status`, { status });
    return data;
  },
  async updateProducedQuantity(id: string, producedQuantity: number): Promise<ProductionOrder> {
    const { data } = await api.put<ProductionOrder>(`/production-orders/${id}`, { producedQuantity });
    return data;
  },
};
