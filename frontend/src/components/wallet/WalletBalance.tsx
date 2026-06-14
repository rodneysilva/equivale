import type { Component } from 'solid-js';
import { Wallet, TrendingUp } from 'lucide-solid';
import GlassCard from '../ui/GlassCard';

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
}

const WalletBalance: Component<WalletBalanceProps> = (props) => {
  return (
    <GlassCard class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Wallet size={20} class="text-white" />
        </div>
        <span class="text-gray-600 dark:text-gray-400 font-medium">Saldo</span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-4xl font-bold gradient-text">
          {props.isLoading ? '...' : props.balance.toLocaleString('pt-BR')}
        </span>
        <span class="text-lg text-gray-500 dark:text-gray-400 font-medium">EQL</span>
      </div>
      <div class="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
        <TrendingUp size={14} />
        <span>Moeda virtual do marketplace</span>
      </div>
    </GlassCard>
  );
};

export default WalletBalance;
