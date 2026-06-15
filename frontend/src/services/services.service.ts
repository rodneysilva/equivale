import { api } from './api';
import {
  mapService, mapPagedResult,
  type BackendServiceDto, type BackendCreateServiceDto, type BackendPagedResult
} from './mappers';
import type { Service, CreateServiceDto, PaginatedResponse } from '../types';

function toBackendCreate(data: CreateServiceDto, providerId?: string): BackendCreateServiceDto {
  return {
    providerId: providerId || '',
    title: data.title,
    description: data.description,
    category: data.category,
    priceInEquivale: data.price,
    duration: data.duration || null,
    location: data.location || null,
  };
}

export const servicesService = {
  async getAll(page = 1, pageSize = 12, category?: string, search?: string, tag?: string): Promise<PaginatedResponse<Service>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    const raw = await api.get<BackendPagedResult<BackendServiceDto>>(`/services?${params}`);
    return mapPagedResult(raw, mapService);
  },

  async getById(id: string): Promise<Service> {
    const raw = await api.get<BackendServiceDto>(`/services/${id}`);
    return mapService(raw);
  },

  async create(data: CreateServiceDto, providerId: string): Promise<Service> {
    const raw = await api.post<BackendServiceDto>('/services', toBackendCreate(data, providerId));
    return mapService(raw);
  },

  async update(id: string, data: Partial<CreateServiceDto>, providerId: string): Promise<Service> {
    const raw = await api.put<BackendServiceDto>(`/services/${id}`, toBackendCreate(data as CreateServiceDto, providerId));
    return mapService(raw);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/services/${id}`);
  },

  async getByProvider(providerId: string): Promise<Service[]> {
    const raw = await api.get<BackendServiceDto[]>(`/services/provider/${providerId}`);
    return raw.map(mapService);
  },

  async hire(serviceId: string): Promise<{ id: string; amount: number }> {
    const raw = await api.post<{ id: string; amount: number }>(`/services/${serviceId}/hire`);
    return raw;
  },
};
