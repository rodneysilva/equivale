import { type Component, createSignal, onMount, createEffect, on, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Check, X, Clock, Package, Truck, CheckCircle, Star } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const txStatusLabel: Record<string, string> = {
  Pending: 'Aguardando confirmação',
  ConfirmedByBuyer: 'Comprador confirmou',
  ConfirmedBySeller: 'Vendedor confirmou',
  Completed: 'Pagamento confirmado',
  Cancelled: 'Cancelada',
};

const txStatusColor: Record<string, string> = {
  Pending: 'eq-badge-warning',
  ConfirmedByBuyer: 'eq-badge-info',
  ConfirmedBySeller: 'eq-badge-info',
  Completed: 'eq-badge-success',
  Cancelled: 'eq-badge-error',
};

const orderStatusLabel: Record<string, string> = {
  OrderPlaced: 'Pedido realizado',
  PaymentConfirmed: 'Pagamento confirmado',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Finished: 'Finalizado',
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

  createEffect(on(() => tab(), () => { load(); }, { defer: true }));

  const update = (id: string, updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));
  };

  const action = async (id: string, fn: (id: string) => Promise<Transaction>) => {
    setActionLoading(id);
    try { update(id, await fn(id)); } catch (err: any) { alert(err.message || 'Erro'); }
    finally { setActionLoading(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const userId = () => auth.currentUser()?.id;

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Meus Pedidos</h1>

      <div class="flex items-center gap-2 mb-6">
        {(['all', 'buyer', 'seller'] as const).map(t => (
          <button onClick={() => setTab(t)} class="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={tab() === t ? { background: 'var(--color-primary)', color: '#fff' } : { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
            {t === 'all' ? 'Todas' : t === 'buyer' ? 'Compras' : 'Vendas'}
          </button>
        ))}
      </div>

      {loading() ? <LoadingSpinner class="py-20" /> : transactions().length === 0 ? (
        <Card class="p-8 text-center"><Clock size={28} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma transação encontrada.</p></Card>
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
                      {/* Title + badges */}
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</span>
                        <span class={`eq-badge ${txStatusColor[t.status]}`}>{txStatusLabel[t.status]}</span>
                        <Show when={t.status === 'Completed'}>
                          <span class="eq-badge eq-badge-info">{orderStatusLabel[t.orderStatus] ?? t.orderStatus}</span>
                        </Show>
                      </div>

                      {/* Info */}
                      <div class="flex items-center gap-3 mt-1 text-xs flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{otherLabel()}: <strong style={{ color: 'var(--color-text-secondary)' }}>{otherParty() || '—'}</strong></span>
                        <span>·</span>
                        <span>{formatDate(t.createdAt)}</span>
                        <Show when={t.quantity > 1}><span>·</span><span>Qtd: {t.quantity}</span></Show>
                      </div>
                      <p class="text-sm font-semibold mt-1 eq-accent">{t.totalPrice} EQL</p>

                      {/* Timeline of order */}
                      <Show when={t.status === 'Completed'}>
                        <div class="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          <Show when={t.shippedAt}><Truck size={11} /> Enviado · </Show>
                          <Show when={t.deliveredAt}><CheckCircle size={11} /> Entregue · </Show>
                          <Show when={t.orderStatus === 'Finished'}><Star size={11} /> Finalizado</Show>
                        </div>
                      </Show>

                      {/* Actions */}
                      <div class="flex items-center gap-2 mt-3 flex-wrap">
                        {/* Transaction confirmation */}
                        <Show when={t.status !== 'Completed' && t.status !== 'Cancelled'}>
                          <Show when={isBuyer() && (t.status === 'Pending' || t.status === 'ConfirmedBySeller')}>
                            <Button size="sm" onClick={() => action(t.id, transactionsService.confirmByBuyer)} disabled={actionLoading() === t.id}>
                              <Check size={12} class="mr-1" /> Confirmar pagamento
                            </Button>
                          </Show>
                          <Show when={!isBuyer() && (t.status === 'Pending' || t.status === 'ConfirmedByBuyer')}>
                            <Button size="sm" onClick={() => action(t.id, transactionsService.confirmBySeller)} disabled={actionLoading() === t.id}>
                              <Check size={12} class="mr-1" /> Confirmar recebimento
                            </Button>
                          </Show>
                          <Button variant="outline" size="sm" onClick={() => action(t.id, transactionsService.cancel)} disabled={actionLoading() === t.id} style={{ color: '#dc2626' }}>
                            <X size={12} class="mr-1" /> Cancelar
                          </Button>
                        </Show>

                        {/* Order logistics (after payment confirmed) */}
                        <Show when={t.status === 'Completed'}>
                          {/* Seller ships */}
                          <Show when={!isBuyer() && t.orderStatus === 'PaymentConfirmed'}>
                            <Button size="sm" onClick={() => action(t.id, transactionsService.markShipped)} disabled={actionLoading() === t.id}>
                              <Truck size={12} class="mr-1" /> Marcar como enviado
                            </Button>
                          </Show>
                          {/* Buyer confirms delivery */}
                          <Show when={isBuyer() && t.orderStatus === 'Shipped'}>
                            <Button size="sm" onClick={() => action(t.id, transactionsService.markDelivered)} disabled={actionLoading() === t.id}>
                              <CheckCircle size={12} class="mr-1" /> Confirmar entrega
                            </Button>
                          </Show>
                          {/* Review */}
                          <Show when={t.orderStatus === 'Delivered' || t.orderStatus === 'Finished'}>
                            <button class="text-xs eq-link flex items-center gap-1" onClick={() => navigate(`/transactions/${t.id}`)}>
                              <Star size={11} /> Avaliar
                            </button>
                          </Show>
                        </Show>
                      </div>
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
