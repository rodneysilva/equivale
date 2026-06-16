import { api } from './api';
import type { AppNotification, PaginatedResponse } from '../types';

export const notificationsService = {
  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ count: number }>('/notifications/unread-count');
    return res.count ?? 0;
  },

  async getAll(page = 1, pageSize = 20): Promise<PaginatedResponse<AppNotification>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<{
      items: AppNotification[];
      totalItems: number;
      totalPages: number;
      page: number;
      pageSize: number;
    }>(`/notifications?${params}`);
    return {
      data: raw.items ?? [],
      total: raw.totalItems ?? 0,
      page: raw.page ?? page,
      pageSize: raw.pageSize ?? pageSize,
      totalPages: raw.totalPages ?? 0,
    };
  },

  markAllRead(): Promise<void> {
    return api.put('/notifications/mark-read');
  },
};
