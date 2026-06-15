export interface Review {
  id: string;
  rating: number;
  comment?: string;
  itemType: string;
  createdAt: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerAvatarUrl?: string;
}
