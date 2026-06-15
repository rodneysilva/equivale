export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  providerId: string;
  providerName?: string;
  providerAvatar?: string;
  duration?: string;
  location?: string;
  status: 'available' | 'completed' | 'pending_moderation';
  communityId?: string;
  communityName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  duration?: string;
  location?: string;
}
