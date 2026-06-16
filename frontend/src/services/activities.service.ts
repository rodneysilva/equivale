import { api } from './api';
import type { UserActivity, PaginatedResponse } from '../types';

export const activitiesService = {
  async getByUser(userId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<UserActivity>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<{ items: UserActivity[]; totalItems: number; totalPages: number; page: number; pageSize: number }>(
      `/users/${userId}/activities?${params}`,
    );
    return {
      data: raw.items ?? [],
      total: raw.totalItems ?? 0,
      page: raw.page ?? page,
      pageSize: raw.pageSize ?? pageSize,
      totalPages: raw.totalPages ?? 0,
    };
  },
};
