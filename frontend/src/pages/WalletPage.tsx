import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Send, LogIn } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LiquidInput from '../components/ui/LiquidInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import WalletBalance from '../components/wallet/WalletBalance';
import TransactionHistory from '../components/wallet/TransactionHistory';
import { walletService } from '../services/wallet.service';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const WalletPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [balance, setBalance] = createSignal(0);
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [txLoading, setTxLoading] = createSignal(true);

  // Transfer form
  const [toUserId, setToUserId] = createSignal('');
  const [amount, setAmount] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [transferring, setTransferring] = createSignal(false);
  const [transferError, setTransferError] = createSignal('');

  createEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadWallet();
  });

  const loadWallet = async () => {
    setLoading(true);
    setTxLoading(true);
    try {
      const [balanceRes, txRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceRes.balance);
      setTransactions(txRes.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setTxLoading(false);
    }
  };

  const handleTransfer = async (e: Event) => {
    e.preventDefault();
    setTransferError('');
    setTransferring(true);
    try {
      const amt = parseFloat(amount());
      if (isNaN(amt) || amt <= 0) {
        setTransferError('Valor inválido');
        return;
      }
      await walletService.transfer({
        toUserId: toUserId(),
        amount: amt,
        description: description() || undefined,
      });
      setToUserId('');
      setAmount('');
      setDescription('');
      loadWallet();
    } catch (err: any) {
      setTransferError(err.message || 'Erro na transferência');
    } finally {
      setTransferring(false);
    }
  };

  if (!auth.isAuthenticated()) {
    return (
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <LogIn size={40} class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 mb-4">Faça login para acessar sua carteira</p>
        <LiquidButton onClick={() => navigate('/login')}>Entrar</LiquidButton>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Carteira</h1>
        <p class="text-gray-500 dark:text-gray-400">Gerencie seu saldo e transações</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance + Transfer */}
        <div class="space-y-6">
          <WalletBalance balance={balance()} isLoading={loading()} />

          {/* Transfer form */}
          <GlassCard class="p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Transferir EQL</h3>
            <form onSubmit={handleTransfer} class="space-y-3">
              <LiquidInput
                label="ID do destinatário"
                value={toUserId()}
                onInput={(e) => setToUserId(e.currentTarget.value)}
                placeholder="ID do usuário"
                required
              />
              <LiquidInput
                label="Valor"
                type="number"
                value={amount()}
                onInput={(e) => setAmount(e.currentTarget.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <LiquidInput
                label="Descrição (opcional)"
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder="Motivo da transferência"
              />
              {transferError() && (
                <p class="text-red-500 text-sm">{transferError()}</p>
              )}
              <LiquidButton type="submit" class="w-full" disabled={transferring()}>
                {transferring() ? (
                  <LoadingSpinner size="w-5 h-5" class="!justify-start" />
                ) : (
                  <>
                    <Send size={18} class="mr-2" />
                    Transferir
                  </>
                )}
              </LiquidButton>
            </form>
          </GlassCard>
        </div>

        {/* Transaction history */}
        <div class="lg:col-span-2">
          <TransactionHistory transactions={transactions()} isLoading={txLoading()} />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
