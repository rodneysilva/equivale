export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface CreatePostDto {
  communityId: string;
  authorId: string;
  content: string;
}
