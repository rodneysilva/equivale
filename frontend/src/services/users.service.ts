import { api } from './api';
import { mapUser, mapPagedResult, type BackendUserDto, type BackendPagedResult } from './mappers';
import type { User, UserCommunity, SocialLink } from '../types';

export interface BackendUserCommunityDto {
  id: string;
  name: string;
  imageUrl?: string | null;
  membersCount: number;
  isOwner: boolean;
  isModerator: boolean;
}

export const usersService = {
  async getAll(page = 1, pageSize = 20): Promise<{ data: User[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendUserDto>>(`/users?${params}`);
    return mapPagedResult(raw, mapUser);
  },

  async getById(id: string): Promise<User> {
    const raw = await api.get<BackendUserDto>(`/users/${id}`);
    return mapUser(raw);
  },

  async getCommunities(id: string): Promise<UserCommunity[]> {
    const raw = await api.get<BackendUserCommunityDto[]>(`/users/${id}/communities`);
    return raw.map((c) => ({ ...c, imageUrl: c.imageUrl ?? undefined }));
  },

  async updateProfile(data: { fullName?: string; bio?: string; avatarUrl?: string; socialLinks?: SocialLink[] }): Promise<User> {
    const payload: Record<string, unknown> = {};
    if (data.fullName) payload.name = data.fullName;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl;
    if (data.socialLinks !== undefined) payload.socialLinks = data.socialLinks;
    const raw = await api.put<BackendUserDto>('/auth/profile', payload);
    return mapUser(raw);
  },
};
