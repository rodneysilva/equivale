import { api } from './api';
import {
  mapProduct, mapPagedResult,
  type BackendProductDto, type BackendCreateProductDto, type BackendPagedResult
} from './mappers';
import type { Product, CreateProductDto, PaginatedResponse } from '../types';

function toBackendCreate(data: CreateProductDto, sellerId?: string): BackendCreateProductDto {
  return {
    sellerId: sellerId || '',
    title: data.title,
    description: data.description,
    category: data.category,
    priceInEquivale: data.price,
    images: data.images?.length ? data.images : data.imageUrl ? [data.imageUrl] : [],
    condition: (data as any).condition || undefined,
    communityId: (data as any).communityId || undefined,
  };
}

export const productsService = {
  async getAll(page = 1, pageSize = 24, category?: string, search?: string, tags?: string[], sellerId?: string, communityId?: string, sortBy?: string): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (tags && tags.length > 0) tags.forEach(t => params.append('tags', t));
    if (sellerId) params.set('sellerId', sellerId);
    if (communityId) params.set('communityId', communityId);
    if (sortBy) params.set('sortBy', sortBy);
    const raw = await api.get<BackendPagedResult<BackendProductDto>>(`/products?${params}`);
    return mapPagedResult(raw, mapProduct);
  },

  async getById(id: string): Promise<Product> {
    const raw = await api.get<BackendProductDto>(`/products/${id}`);
    return mapProduct(raw);
  },

  async create(data: CreateProductDto, sellerId: string): Promise<Product> {
    const raw = await api.post<BackendProductDto>('/products', toBackendCreate(data, sellerId));
    return mapProduct(raw);
  },

  async update(id: string, data: Partial<CreateProductDto>, sellerId: string): Promise<Product> {
    const raw = await api.put<BackendProductDto>(`/products/${id}`, toBackendCreate(data as CreateProductDto, sellerId));
    return mapProduct(raw);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/products/${id}`);
  },

  async getBySeller(sellerId: string): Promise<Product[]> {
    const raw = await api.get<BackendProductDto[]>(`/products/seller/${sellerId}`);
    return raw.map(mapProduct);
  },

  async getByCategory(category: string): Promise<Product[]> {
    const raw = await api.get<BackendProductDto[]>(`/products/category/${category}`);
    return raw.map(mapProduct);
  },
};
