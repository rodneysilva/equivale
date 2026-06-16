export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}
