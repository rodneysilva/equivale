import { api } from './api';
import {
  mapTransaction,
  type BackendTransactionDto
} from './mappers';
import type { Transaction, TransferDto } from '../types';

export const walletService = {
  async getBalance(): Promise<number> {
    const user = await api.get<{ walletBalance: number }>('/auth/profile');
    return user.walletBalance;
  },

  async getTransactions(page = 1, pageSize = 20): Promise<{ data: Transaction[]; total: number }> {
    // Use the transactions endpoint — but we need userId from token
    // The backend /transactions/user/{userId} requires userId
    // For now, we get from auth profile which contains walletBalance
    // and we'll use the transactions endpoint once we have the user id
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    try {
      const raw = await api.get<{ items: BackendTransactionDto[]; totalItems: number }>(`/wallet/transactions?${params}`);
      return { data: raw.items.map(mapTransaction), total: raw.totalItems };
    } catch {
      return { data: [], total: 0 };
    }
  },

  async transfer(data: TransferDto): Promise<Transaction> {
    const raw = await api.post<BackendTransactionDto>('/transactions', {
      fromUserId: '',
      toUserId: data.toUserId,
      amount: data.amount,
      description: data.description || 'Transfer',
      transactionType: 'Transfer',
    });
    return mapTransaction(raw);
  },
};
