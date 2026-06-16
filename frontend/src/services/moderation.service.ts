import { api } from './api';
import type { BackendPagedResult } from './mappers';

export interface ModerationPost {
  id: string;
  communityId: string;
  communityName?: string | null;
  authorId: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  isHidden: boolean;
  hiddenAt?: string | null;
  hiddenBy?: string | null;
}

export interface ModerationComment {
  id: string;
  postId: string;
  communityId?: string | null;
  communityName?: string | null;
  authorId: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  isHidden: boolean;
  hiddenAt?: string | null;
  hiddenBy?: string | null;
}

interface BackendModerationPost {
  id: string;
  communityId: string;
  communityName?: string | null;
  authorId: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
  isHidden: boolean;
  hiddenAt?: string | null;
  hiddenBy?: string | null;
}

interface BackendModerationComment {
  id: string;
  postId: string;
  communityId?: string | null;
  communityName?: string | null;
  authorId: string;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  isHidden: boolean;
  hiddenAt?: string | null;
  hiddenBy?: string | null;
}

export const moderationService = {
  async listPosts(page = 1, pageSize = 50): Promise<{ items: ModerationPost[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendModerationPost>>(`/admin/moderation/posts?${params}`);
    return { items: raw.items as ModerationPost[], total: raw.totalItems, totalPages: raw.totalPages };
  },

  async listComments(page = 1, pageSize = 50): Promise<{ items: ModerationComment[]; total: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const raw = await api.get<BackendPagedResult<BackendModerationComment>>(`/admin/moderation/comments?${params}`);
    return { items: raw.items as ModerationComment[], total: raw.totalItems, totalPages: raw.totalPages };
  },

  async hidePost(id: string): Promise<void> {
    await api.put(`/admin/moderation/posts/${id}/hide`);
  },

  async unhidePost(id: string): Promise<void> {
    await api.put(`/admin/moderation/posts/${id}/unhide`);
  },

  async deletePost(id: string): Promise<void> {
    await api.del(`/admin/moderation/posts/${id}`);
  },

  async hideComment(id: string): Promise<void> {
    await api.put(`/admin/moderation/comments/${id}/hide`);
  },

  async unhideComment(id: string): Promise<void> {
    await api.put(`/admin/moderation/comments/${id}/unhide`);
  },

  async deleteComment(id: string): Promise<void> {
    await api.del(`/admin/moderation/comments/${id}`);
  },
};
