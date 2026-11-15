import { api } from './api';
import type { CreateUserDTO, Role, User } from '../types';

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },
  async create(payload: CreateUserDTO): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  async updateRole(id: string, role: Role): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, { role });
    return data;
  },
};
