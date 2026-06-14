import { api } from './api';
import type { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types';

export const productsService = {
  async getAll(page = 1, pageSize = 12, category?: string, search?: string): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    return api.get<PaginatedResponse<Product>>(`/products?${params}`);
  },

  async getById(id: string): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },

  async create(data: CreateProductDto): Promise<Product> {
    return api.post<Product>('/products', data);
  },

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return api.put<Product>(`/products/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.del<void>(`/products/${id}`);
  },

  async getBySeller(sellerId: string): Promise<Product[]> {
    return api.get<Product[]>(`/products/seller/${sellerId}`);
  },

  async getByCategory(category: string): Promise<Product[]> {
    return api.get<Product[]>(`/products/category/${category}`);
  },

  async buy(productId: string): Promise<{ transactionId: string }> {
    return api.post<{ transactionId: string }>(`/products/${productId}/buy`);
  },
};
