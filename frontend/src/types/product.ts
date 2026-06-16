export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
  condition: 'new' | 'used' | 'refurbished';
  stock?: number;
  shippingCost?: number;
  status: 'available' | 'sold' | 'pending_moderation';
  communityId?: string;
  communityName?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  condition?: 'new' | 'used' | 'refurbished';
  communityId?: string;
  stock?: number;
  tags?: string[];
}
