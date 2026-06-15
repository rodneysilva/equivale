export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  coverUrl?: string;
  ownerId: string;
  ownerName?: string;
  membersCount: number;
  postsCount: number;
  type: 'open' | 'private';
  moderators: string[];
  moderatorNames?: string[];
  inviteCode?: string;
  productVisibility: 'public' | 'members';
  createdAt: string;
}

export interface CreateCommunityDto {
  name: string;
  description: string;
  imageUrl?: string;
  coverUrl?: string;
  type?: 'open' | 'private';
  productVisibility?: 'public' | 'members';
}
