import { api } from './api';
import type { Community, CreateCommunityDto } from '../types';

export const communitiesService = {
  async getAll(page = 1, pageSize = 12): Promise<{ data: Community[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return api.get<{ data: Community[]; total: number }>(`/communities?${params}`);
  },

  async getById(id: string): Promise<Community> {
    return api.get<Community>(`/communities/${id}`);
  },

  async create(data: CreateCommunityDto): Promise<Community> {
    return api.post<Community>('/communities', data);
  },

  async update(id: string, data: Partial<CreateCommunityDto>): Promise<Community> {
    return api.put<Community>(`/communities/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/communities/${id}`);
  },

  async join(id: string): Promise<void> {
    return api.post<void>(`/communities/${id}/join`);
  },

  async leave(id: string): Promise<void> {
    return api.post<void>(`/communities/${id}/leave`);
  },
};
