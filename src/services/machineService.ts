import { api } from './api';
import type { CreateMachineDTO, Machine, MachineStatus } from '../types';

export const machineService = {
  async list(): Promise<Machine[]> {
    const { data } = await api.get<Machine[]>('/machines');
    return data;
  },
  async create(payload: CreateMachineDTO): Promise<Machine> {
    const { data } = await api.post<Machine>('/machines', payload);
    return data;
  },
  async updateStatus(id: string, status: MachineStatus): Promise<void> {
    await api.patch(`/machines/${id}/status`, { status });
  },
};
