import { api } from './api';
import type { Service, CreateServiceDto, UpdateServiceDto, PaginatedResponse } from '../types';

export const servicesService = {
  async getAll(page = 1, pageSize = 12, category?: string, search?: string): Promise<{ data: Service[]; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const items = await api.get<Service[]>(`/services?${params}`);
    return { data: items, totalPages: 1 };
  },

  async getById(id: string): Promise<Service> {
    return api.get<Service>(`/services/${id}`);
  },

  async create(data: CreateServiceDto): Promise<Service> {
    return api.post<Service>('/services', data);
  },

  async update(id: string, data: UpdateServiceDto): Promise<Service> {
    return api.put<Service>(`/services/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/services/${id}`);
  },

  async getByProvider(providerId: string): Promise<Service[]> {
    return api.get<Service[]>(`/services/provider/${providerId}`);
  },

  async getByCategory(category: string): Promise<Service[]> {
    return api.get<Service[]>(`/services/category/${category}`);
  },

  async hire(serviceId: string): Promise<{ transactionId: string }> {
    return api.post<{ transactionId: string }>(`/services/${serviceId}/hire`);
  },
};
