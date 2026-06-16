import { api } from './api';
import type { Comment } from '../types/comment';

export const commentsService = {
  async getByPost(communityId: string, postId: string): Promise<Comment[]> {
    return api.get<Comment[]>(`/communities/${communityId}/posts/${postId}/comments`);
  },

  async create(
    communityId: string,
    postId: string,
    content: string,
    parentCommentId?: string,
  ): Promise<Comment> {
    return api.post<Comment>(
      `/communities/${communityId}/posts/${postId}/comments`,
      { content, parentCommentId: parentCommentId ?? null },
    );
  },

  async delete(communityId: string, postId: string, commentId: string): Promise<void> {
    return api.del<void>(`/communities/${communityId}/posts/${postId}/comments/${commentId}`);
  },
};
