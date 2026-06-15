import { type Component, createSignal, onMount, createEffect, on, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Check, X, Clock, Package } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const statusLabel: Record<string, string> = {
  Pending: 'Pendente',
  ConfirmedByBuyer: 'Comprador confirmou',
  ConfirmedBySeller: 'Vendedor confirmou',
  Completed: 'Concluída',
  Cancelled: 'Cancelada',
};

const statusColor: Record<string, string> = {
  Pending: 'eq-badge-warning',
  ConfirmedByBuyer: 'eq-badge-info',
  ConfirmedBySeller: 'eq-badge-info',
  Completed: 'eq-badge-success',
  Cancelled: 'eq-badge-error',
};

const TransactionsPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [tab, setTab] = createSignal<'all' | 'buyer' | 'seller'>('all');
  const [actionLoading, setActionLoading] = createSignal<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await transactionsService.getAll(tab() === 'all' ? undefined : tab(), 1, 50);
      setTransactions(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  onMount(() => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    load();
  });

  const handleTab = (t: 'all' | 'buyer' | 'seller') => { setTab(t); };

  // Reload when tab changes
  createEffect(on(() => tab(), () => { load(); }, { defer: true }));

  const confirmBuyer = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await transactionsService.confirmByBuyer(id);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const confirmSeller = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await transactionsService.confirmBySeller(id);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const cancel = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await transactionsService.cancel(id);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const userId = () => auth.currentUser()?.id;

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Minhas Transações</h1>

      {/* Tabs */}
      <div class="flex items-center gap-2 mb-6">
        {(['all', 'buyer', 'seller'] as const).map(t => (
          <button
            onClick={() => handleTab(t)}
            class={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${tab() === t ? 'eq-badge eq-badge-primary' : 'eq-badge'}`}
            style={tab() === t ? {} : { background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {t === 'all' ? 'Todas' : t === 'buyer' ? 'Compras' : 'Vendas'}
          </button>
        ))}
      </div>

      {loading() ? <LoadingSpinner class="py-20" /> : transactions().length === 0 ? (
        <Card class="p-8 text-center">
          <Clock size={28} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma transação encontrada.</p>
        </Card>
      ) : (
        <div class="space-y-3">
          <For each={transactions()}>
            {(t) => {
              const isBuyer = () => t.buyerId === userId();
              const otherParty = () => isBuyer() ? t.sellerName : t.buyerName;
              const otherLabel = () => isBuyer() ? 'Vendedor' : 'Comprador';

              return (
                <Card class="p-4">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                      <Package size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</span>
                        <span class={`eq-badge ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                        <span class="eq-badge" style={{ background: 'var(--color-surface-alt)' }}>{t.itemType === 'Product' ? 'Produto' : 'Serviço'}</span>
                      </div>
                      <div class="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{otherLabel()}: <strong style={{ color: 'var(--color-text-secondary)' }}>{otherParty() || '—'}</strong></span>
                        <span>·</span>
                        <span>{formatDate(t.createdAt)}</span>
                        <Show when={t.quantity > 1}><span>·</span><span>Qtd: {t.quantity}</span></Show>
                      </div>
                      <p class="text-sm font-semibold mt-1 eq-accent">{t.totalPrice} EQL</p>

                      {/* Actions */}
                      <Show when={t.status !== 'Completed' && t.status !== 'Cancelled'}>
                        <div class="flex items-center gap-2 mt-3">
                          {/* Buyer confirm */}
                          <Show when={isBuyer() && (t.status === 'Pending' || t.status === 'ConfirmedBySeller')}>
                            <Button size="sm" onClick={() => confirmBuyer(t.id)} disabled={actionLoading() === t.id}>
                              <Check size={12} class="mr-1" /> Confirmar recebimento
                            </Button>
                          </Show>
                          {/* Seller confirm */}
                          <Show when={!isBuyer() && (t.status === 'Pending' || t.status === 'ConfirmedByBuyer')}>
                            <Button size="sm" onClick={() => confirmSeller(t.id)} disabled={actionLoading() === t.id}>
                              <Check size={12} class="mr-1" /> Confirmar entrega
                            </Button>
                          </Show>
                          {/* Cancel */}
                          <Button variant="outline" size="sm" onClick={() => cancel(t.id)} disabled={actionLoading() === t.id} style={{ color: '#dc2626' }}>
                            <X size={12} class="mr-1" /> Cancelar
                          </Button>
                        </div>
                      </Show>

                      {/* Review link for completed */}
                      <Show when={t.status === 'Completed'}>
                        <button class="text-xs eq-link mt-2" onClick={() => navigate(`/transactions/${t.id}`)}>
                          Avaliar transação →
                        </button>
                      </Show>
                    </div>
                  </div>
                </Card>
              );
            }}
          </For>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
