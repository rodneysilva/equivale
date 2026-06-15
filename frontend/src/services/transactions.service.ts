import { api } from './api';
import type { Transaction, PaginatedResponse } from '../types';

export interface BackendTransactionDto {
  id: string;
  buyerId: string;
  buyerName?: string | null;
  sellerId: string;
  sellerName?: string | null;
  itemType: string;
  itemId: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  buyerConfirmedAt?: string | null;
  sellerConfirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

interface BackendPagedResult<T> { items: T[]; totalItems: number; totalPages: number; page: number; pageSize: number; }

function mapTransaction(d: BackendTransactionDto): Transaction {
  return {
    id: d.id,
    buyerId: d.buyerId,
    buyerName: d.buyerName ?? undefined,
    sellerId: d.sellerId,
    sellerName: d.sellerName ?? undefined,
    itemType: d.itemType as 'Product' | 'Service',
    itemId: d.itemId,
    itemTitle: d.itemTitle,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
    totalPrice: d.totalPrice,
    status: d.status as Transaction['status'],
    buyerConfirmedAt: d.buyerConfirmedAt ?? undefined,
    sellerConfirmedAt: d.sellerConfirmedAt ?? undefined,
    completedAt: d.completedAt ?? undefined,
    createdAt: d.createdAt,
  };
}

export const transactionsService = {
  async create(itemId: string, itemType: 'Product' | 'Service', quantity = 1): Promise<Transaction> {
    const raw = await api.post<BackendTransactionDto>('/transactions', { itemId, itemType, quantity });
    return mapTransaction(raw);
  },

  async getAll(role?: 'buyer' | 'seller', page = 1, pageSize = 20): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (role) params.set('role', role);
    const raw = await api.get<BackendPagedResult<BackendTransactionDto>>(`/transactions?${params}`);
    return { data: raw.items.map(mapTransaction), total: raw.totalItems, page: raw.page, pageSize: raw.pageSize, totalPages: raw.totalPages };
  },

  async getById(id: string): Promise<Transaction> {
    const raw = await api.get<BackendTransactionDto>(`/transactions/${id}`);
    return mapTransaction(raw);
  },

  async confirmByBuyer(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/confirm-buyer`);
    return mapTransaction(raw);
  },

  async confirmBySeller(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/confirm-seller`);
    return mapTransaction(raw);
  },

  async cancel(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/cancel`);
    return mapTransaction(raw);
  },
};

export const reviewsService = {
  async getByUser(userId: string): Promise<Review[]> {
    return api.get<Review[]>(`/reviews/user/${userId}`);
  },

  async create(transactionId: string, rating: number, comment?: string): Promise<unknown> {
    return api.post('/reviews', { transactionId, rating, comment });
  },
};
