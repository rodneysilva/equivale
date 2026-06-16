import { type Component, createSignal, onMount, For, Show, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, Package, Zap } from 'lucide-solid';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { Transaction } from '../types';

const txLabel: Record<string, string> = { Pending: 'Pendente', ConfirmedByBuyer: 'Comprador confirmou', ConfirmedBySeller: 'Vendedor confirmou', Completed: 'Concluída', Cancelled: 'Cancelada' };
const txColor: Record<string, string> = { Pending: 'eq-badge-warning', ConfirmedByBuyer: 'eq-badge-info', ConfirmedBySeller: 'eq-badge-info', Completed: 'eq-badge-success', Cancelled: 'eq-badge-error' };

const WalletPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  let loaded = false;

  const userId = () => auth.currentUser()?.id;

  createEffect(() => {
    if (!auth.isAuthenticated() || !userId() || loaded) return;
    loaded = true;
    load();
  });

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) navigate('/login');
  });

  const load = async () => {
    try {
      const res = await transactionsService.getAll(undefined, 1, 100);
      setTransactions(res.data);
    } catch { toast.error('Não foi possível carregar sua carteira.'); }
    finally { setLoading(false); }
  };

  const fmtDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const entries = () => {
    const uid = userId();
    return transactions()
      .filter(t => t.status !== 'Cancelled')
      .map(t => ({
        tx: t,
        isBuyer: t.buyerId === uid,
        amount: t.totalPrice,
      }))
      .sort((a, b) => new Date(b.tx.createdAt).getTime() - new Date(a.tx.createdAt).getTime());
  };

  const totalIn = () => entries().filter(e => !e.isBuyer).reduce((s, e) => s + e.amount, 0);
  const totalOut = () => entries().filter(e => e.isBuyer).reduce((s, e) => s + e.amount, 0);

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="flex items-center gap-2 text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        <Wallet size={24} class="eq-brand" /> Carteira
      </h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <>
          {/* Summary */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <Card class="p-5">
              <Wallet size={20} class="eq-brand mb-2" />
              <p class="text-3xl font-bold eq-accent">{auth.currentUser()?.walletBalance ?? 0}</p>
              <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Saldo disponível (EQL)</p>
            </Card>
            <Card class="p-5">
              <ArrowDownLeft size={20} class="mb-2" style={{ color: '#059669' }} />
              <p class="text-3xl font-bold" style={{ color: '#059669' }}>+{totalIn()}</p>
              <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Total recebido (EQL)</p>
            </Card>
            <Card class="p-5">
              <ArrowUpRight size={20} class="mb-2" style={{ color: '#dc2626' }} />
              <p class="text-3xl font-bold" style={{ color: '#dc2626' }}>-{totalOut()}</p>
              <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Total gasto (EQL)</p>
            </Card>
          </div>

          {/* Statement */}
          <h2 class="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Extrato de movimentações</h2>
          <Card class="overflow-hidden">
            <Show when={entries().length > 0} fallback={
              <div class="p-8 text-center"><Clock size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma movimentação ainda.</p></div>
            }>
              <For each={entries()}>{(e) => (
                <div class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface-alt)]" style={{ 'border-bottom': '1px solid var(--color-border)' }} onClick={() => navigate(`/transactions/${e.tx.id}`)}>
                  <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: e.isBuyer ? '#fee2e2' : '#dcfce7' }}>
                    {e.isBuyer ? <ArrowUpRight size={15} style={{ color: '#dc2626' }} /> : <ArrowDownLeft size={15} style={{ color: '#059669' }} />}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm truncate" style={{ color: 'var(--color-text)' }}>{e.tx.itemTitle}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {e.isBuyer ? `De: ${e.tx.sellerName ?? '—'}` : `Para: ${e.tx.buyerName ?? '—'}`} · {fmtDateTime(e.tx.createdAt)}
                    </p>
                  </div>
                  <span class={`eq-badge ${txColor[e.tx.status]} shrink-0`}>{txLabel[e.tx.status]}</span>
                  <span class="text-sm font-bold shrink-0" style={{ color: e.isBuyer ? '#dc2626' : '#059669' }}>
                    {e.isBuyer ? '-' : '+'}{e.amount} EQL
                  </span>
                </div>
              )}</For>
            </Show>
          </Card>
        </>
      )}
    </div>
  );
};

export default WalletPage;
