import { api } from './api';
import type { Transaction, TransferDto } from '../types';

export const walletService = {
  async getBalance(): Promise<{ balance: number }> {
    return api.get<{ balance: number }>('/wallet/balance');
  },

  async getTransactions(page = 1, pageSize = 20): Promise<{ data: Transaction[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return api.get<{ data: Transaction[]; total: number }>(`/wallet/transactions?${params}`);
  },

  async transfer(data: TransferDto): Promise<Transaction> {
    return api.post<Transaction>('/wallet/transfer', data);
  },
};
