import { api } from './api';
import {
  mapCommunity, mapPagedResult,
  type BackendCommunityDto, type BackendCreateCommunityDto, type BackendPagedResult
} from './mappers';
import type { Community, CreateCommunityDto, PaginatedResponse } from '../types';

export interface CommunityMember {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  isOwner: boolean;
  isModerator: boolean;
}

export const communitiesService = {
  async getAll(page = 1, pageSize = 12): Promise<PaginatedResponse<Community>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendCommunityDto>>(`/communities?${params}`);
    return mapPagedResult(raw, mapCommunity);
  },

  async getById(id: string): Promise<Community> {
    const raw = await api.get<BackendCommunityDto>(`/communities/${id}`);
    return mapCommunity(raw);
  },

  async create(data: CreateCommunityDto, creatorId: string): Promise<Community> {
    const payload: BackendCreateCommunityDto = {
      name: data.name,
      description: data.description,
      creatorId,
      imageUrl: data.imageUrl || null,
      coverUrl: data.coverUrl || null,
      type: data.type || 'open',
      productVisibility: data.productVisibility || 'public',
    };
    const raw = await api.post<BackendCommunityDto>('/communities', payload);
    return mapCommunity(raw);
  },

  async update(id: string, data: Partial<CreateCommunityDto>): Promise<Community> {
    const payload: Record<string, unknown> = {};
    if (data.name) payload.name = data.name;
    if (data.description) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
    if (data.coverUrl !== undefined) payload.coverUrl = data.coverUrl;
    if (data.type) payload.type = data.type;
    if (data.productVisibility) payload.productVisibility = data.productVisibility;
    const raw = await api.put<BackendCommunityDto>(`/communities/${id}`, payload);
    return mapCommunity(raw);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/communities/${id}`);
  },

  async join(id: string, password?: string, message?: string): Promise<void> {
    return api.post<void>(`/communities/${id}/join`, { password, message });
  },

  async leave(id: string): Promise<void> {
    return api.post<void>(`/communities/${id}/leave`);
  },

  async addModerator(communityId: string, userId: string): Promise<void> {
    return api.post<void>(`/communities/${communityId}/moderators`, { userId });
  },

  async removeModerator(communityId: string, userId: string): Promise<void> {
    return api.del<void>(`/communities/${communityId}/moderators/${userId}`);
  },

  async getByMember(userId: string): Promise<Community[]> {
    const raw = await api.get<BackendCommunityDto[]>(`/communities/member/${userId}`);
    return raw.map(mapCommunity);
  },

  async getMembers(id: string): Promise<CommunityMember[]> {
    return api.get<CommunityMember[]>(`/communities/${id}/members`);
  },
};
