import { api } from './api';
import type { Post } from '../types/post';
import type { PaginatedResponse } from '../types';

export const postsService = {
  async getByCommunity(communityId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<any>(`/communities/${communityId}/posts?${params}`);
    return {
      data: raw.items || raw.data || [],
      total: raw.totalItems || raw.total || 0,
      page: raw.page || page,
      pageSize: raw.pageSize || pageSize,
      totalPages: raw.totalPages || Math.ceil((raw.totalItems || 0) / pageSize),
    };
  },

  async create(communityId: string, content: string): Promise<Post> {
    return api.post<Post>(`/communities/${communityId}/posts`, { communityId, authorId: '', content });
  },

  async delete(communityId: string, postId: string): Promise<void> {
    return api.del<void>(`/communities/${communityId}/posts/${postId}`);
  },
};
