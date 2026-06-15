// Adapter layer: backend DTO field names -> frontend types
// This isolates the frontend from backend naming conventions.

// --- Auth ---
export interface BackendAuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: number;
  walletBalance: number;
}

export interface BackendUserDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  socialLinks?: { type: string; url: string }[];
  role: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendRegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface BackendLoginDto {
  email: string;
  password: string;
}

// --- Product ---
export interface BackendProductDto {
  id: string;
  sellerId: string;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  title: string;
  description: string;
  category: string;
  priceInEquivale: number;
  shippingCost: number;
  images: string[];
  status: string;
  condition: string;
  communityId?: string | null;
  communityName?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCreateProductDto {
  sellerId: string;
  title: string;
  description: string;
  category: string;
  priceInEquivale: number;
  images?: string[];
  condition?: string;
  communityId?: string | null;
  tags?: string[];
}

// --- Service ---
export interface BackendServiceDto {
  id: string;
  providerId: string;
  providerName?: string | null;
  providerAvatarUrl?: string | null;
  title: string;
  description: string;
  category: string;
  priceInEquivale: number;
  images?: string[];
  duration?: string | null;
  location?: string | null;
  status: string;
  communityId?: string | null;
  communityName?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCreateServiceDto {
  providerId: string;
  title: string;
  description: string;
  category: string;
  priceInEquivale: number;
  duration?: string | null;
  location?: string | null;
  communityId?: string | null;
  tags?: string[];
}

// --- Community ---
export interface BackendCommunityDto {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  coverUrl?: string | null;
  creatorId: string;
  creatorName?: string | null;
  membersCount: number;
  type: string;
  moderators: string[];
  moderatorNames?: string[] | null;
  inviteCode?: string | null;
  productVisibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCreateCommunityDto {
  name: string;
  description: string;
  creatorId: string;
  imageUrl?: string | null;
  coverUrl?: string | null;
  type?: string;
  productVisibility?: string;
}

// --- Transaction ---
export interface BackendTransactionDto {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  transactionType: string;
  relatedItemId?: string | null;
  createdAt: string;
}

// --- Paged ---
export interface BackendPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ============== Mappers (backend -> frontend) ==============

import type {
  User, AuthResponse, Product, Service, Community,
  Transaction, PaginatedResponse
} from '../types';

export function mapAuthResponse(data: BackendAuthResponse): AuthResponse {
  return {
    token: data.token,
    user: {
      id: data.userId,
      username: data.name,
      email: data.email,
      fullName: data.name,
      role: data.role === 0 ? 'admin' : 'user',
      walletBalance: data.walletBalance ?? 0,
      createdAt: new Date().toISOString(),
      isBanned: false,
    },
  };
}

export function mapUser(data: BackendUserDto): User {
  return {
    id: data.id,
    username: data.name,
    email: data.email,
    fullName: data.name,
    bio: data.bio ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    socialLinks: data.socialLinks ?? undefined,
    role: data.role === 'Admin' ? 'admin' : 'user',
    walletBalance: data.walletBalance,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isBanned: false,
  };
}

export function mapProduct(data: BackendProductDto): Product {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.priceInEquivale,
    shippingCost: data.shippingCost ?? 0,
    category: data.category,
    imageUrl: data.images?.[0],
    images: data.images,
    sellerId: data.sellerId,
    sellerName: data.sellerName ?? undefined,
    sellerAvatar: data.sellerAvatarUrl ?? undefined,
    condition: mapCondition(data.condition),
    status: mapProductStatus(data.status),
    communityId: data.communityId ?? undefined,
    communityName: data.communityName ?? undefined,
    tags: data.tags ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function mapService(data: BackendServiceDto): Service {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.priceInEquivale,
    category: data.category,
    imageUrl: data.images?.[0] ?? data.images?.[0],
    providerId: data.providerId,
    providerName: data.providerName ?? undefined,
    providerAvatar: data.providerAvatarUrl ?? undefined,
    status: mapServiceStatus(data.status),
    duration: data.duration ?? undefined,
    location: data.location ?? undefined,
    communityId: data.communityId ?? undefined,
    communityName: data.communityName ?? undefined,
    tags: data.tags ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function mapCommunity(data: BackendCommunityDto): Community {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl ?? undefined,
    coverUrl: data.coverUrl ?? undefined,
    ownerId: data.creatorId,
    ownerName: data.creatorName ?? undefined,
    membersCount: data.membersCount,
    postsCount: 0,
    type: data.type as 'open' | 'private',
    moderators: data.moderators,
    moderatorNames: data.moderatorNames ?? undefined,
    inviteCode: data.inviteCode ?? undefined,
    productVisibility: data.productVisibility as 'public' | 'members',
    createdAt: data.createdAt,
  };
}

export function mapTransaction(data: BackendTransactionDto): Transaction {
  return {
    id: data.id,
    type: mapTransactionType(data.transactionType),
    amount: data.amount,
    description: data.description,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    itemId: data.relatedItemId ?? undefined,
    createdAt: data.createdAt,
  };
}

export function mapPagedResult<TBackend, TFrontend>(
  data: BackendPagedResult<TBackend>,
  mapItem: (item: TBackend) => TFrontend
): PaginatedResponse<TFrontend> {
  return {
    data: data.items.map(mapItem),
    total: data.totalItems,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };
}

// Helpers
function mapCondition(backendCondition: string): 'new' | 'used' | 'refurbished' {
  switch (backendCondition.toLowerCase()) {
    case 'used': return 'used';
    case 'refurbished': return 'refurbished';
    default: return 'new';
  }
}

function mapProductStatus(backendStatus: string): 'available' | 'sold' | 'pending_moderation' {
  switch (backendStatus.toLowerCase()) {
    case 'active': return 'available';
    case 'sold': return 'sold';
    case 'pending': return 'pending_moderation';
    default: return 'available';
  }
}

function mapServiceStatus(backendStatus: string): 'available' | 'completed' | 'pending_moderation' {
  switch (backendStatus.toLowerCase()) {
    case 'active': return 'available';
    case 'completed': return 'completed';
    case 'pending': return 'pending_moderation';
    default: return 'available';
  }
}

function mapTransactionType(backendType: string): 'purchase' | 'sale' | 'transfer' | 'bonus' {
  switch (backendType.toLowerCase()) {
    case 'purchase': return 'purchase';
    case 'transfer': return 'transfer';
    case 'bonus': return 'bonus';
    default: return 'purchase';
  }
}
