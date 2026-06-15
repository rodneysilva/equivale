// User types
export interface SocialLink {
  type: string;
  url: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  role: 'user' | 'admin';
  walletBalance: number;
  createdAt: string;
  updatedAt?: string;
  isBanned: boolean;
}

export interface UserCommunity {
  id: string;
  name: string;
  imageUrl?: string;
  membersCount: number;
  isOwner: boolean;
  isModerator: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  itemType: 'Product' | 'Service';
  itemId: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'OrderPlaced' | 'OrderConfirmed' | 'Shipped' | 'Delivered' | 'Finished' | 'Cancelled';
  trackingInfo?: string;
  deliveryAddress?: string;
  orderPlacedAt?: string;
  orderConfirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  finishedAt?: string;
  shippingCost?: number;
  createdAt: string;
}

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

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product types
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
}

// Service types
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

// Community types
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

// Transaction / Wallet types
export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'transfer' | 'bonus';
  amount: number;
  description: string;
  fromUserId: string;
  toUserId: string;
  itemId?: string;
  createdAt: string;
}

export interface TransferDto {
  toUserId: string;
  amount: number;
  description?: string;
}

// Review types
export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewerName?: string;
  targetId: string;
  targetType: 'product' | 'service' | 'user';
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Moderation
export interface ModerationItem {
  id: string;
  type: 'product' | 'service';
  title: string;
  description: string;
  submittedById: string;
  submittedByName?: string;
  createdAt: string;
}
