import { api } from './api';
import { mapUser, mapPagedResult, type BackendUserDto, type BackendPagedResult } from './mappers';
import { mapProduct, type BackendProductDto } from './mappers';
import type { User, Product } from '../types';

export interface AdminStats {
  users: number;
  products: number;
  services: number;
  communities: number;
  transactions: number;
  completedTransactions: number;
  totalFeesCollected: number;
  totalVolume: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats>('/admin/stats');
  },

  async updateUserRole(id: string, role: string): Promise<void> {
    await api.put(`/admin/users/${id}/role?role=${role}`);
  },

  async banUser(id: string): Promise<void> {
    await api.put(`/admin/users/${id}/ban`);
  },

  async deleteProduct(id: string): Promise<void> {
    await api.del(`/admin/products/${id}`);
  },

  async deleteService(id: string): Promise<void> {
    await api.del(`/admin/services/${id}`);
  },

  async deleteCommunity(id: string): Promise<void> {
    await api.del(`/admin/communities/${id}`);
  },

  async getAllUsers(page = 1, pageSize = 50): Promise<{ data: User[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendUserDto>>(`/users?${params}`);
    return mapPagedResult(raw, mapUser);
  },

  async getAllProducts(page = 1, pageSize = 50): Promise<{ data: Product[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendProductDto>>(`/products?${params}`);
    return mapPagedResult(raw, mapProduct);
  },
};
