import type { Component } from 'solid-js';
import { ArrowUpRight, ArrowDownLeft, Gift } from 'lucide-solid';
import type { Transaction } from '../../types';
import GlassCard from '../ui/GlassCard';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionHistory: Component<TransactionHistoryProps> = (props) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ArrowUpRight size={16} class="text-red-500" />;
      case 'sale': return <ArrowDownLeft size={16} class="text-green-500" />;
      case 'transfer': return <ArrowUpRight size={16} class="text-blue-500" />;
      case 'bonus': return <Gift size={16} class="text-purple-500" />;
      default: return null;
    }
  };

  const getAmountClass = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-red-600 dark:text-red-400';
      case 'sale': case 'bonus': return 'text-green-600 dark:text-green-400';
      case 'transfer': return 'text-blue-600 dark:text-blue-400';
      default: return '';
    }
  };

  const getPrefix = (type: string) => {
    switch (type) {
      case 'purchase': return '-';
      case 'sale': case 'bonus': return '+';
      default: return '';
    }
  };

  return (
    <GlassCard class="overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white">Histórico de Transações</h3>
      </div>
      {props.isLoading ? (
        <div class="p-4 space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div class="flex items-center gap-3 animate-pulse">
              <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : !props.transactions || props.transactions.length === 0 ? (
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          Nenhuma transação realizada
        </div>
      ) : (
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          {props.transactions.map(tx => (
            <li class="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {getIcon(tx.type)}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span class={`text-sm font-semibold ${getAmountClass(tx.type)}`}>
                {getPrefix(tx.type)}{tx.amount} EQL
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
};

export default TransactionHistory;
