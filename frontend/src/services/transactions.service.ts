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
  trackingInfo?: string | null;
  orderPlacedAt?: string | null;
  orderConfirmedAt?: string | null;
  paymentReleasedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  finishedAt?: string | null;
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
    trackingInfo: d.trackingInfo ?? undefined,
    orderPlacedAt: d.orderPlacedAt ?? undefined,
    orderConfirmedAt: d.orderConfirmedAt ?? undefined,
    paymentReleasedAt: d.paymentReleasedAt ?? undefined,
    shippedAt: d.shippedAt ?? undefined,
    deliveredAt: d.deliveredAt ?? undefined,
    finishedAt: d.finishedAt ?? undefined,
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

  async sellerConfirmOrder(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/confirm-order`);
    return mapTransaction(raw);
  },

  async buyerReleasePayment(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/release-payment`);
    return mapTransaction(raw);
  },

  async sellerShip(id: string, trackingInfo?: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/ship`, { trackingInfo });
    return mapTransaction(raw);
  },

  async buyerConfirmDelivery(id: string): Promise<Transaction> {
    const raw = await api.put<BackendTransactionDto>(`/transactions/${id}/confirm-delivery`);
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
