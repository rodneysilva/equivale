import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Check, X, Truck, CheckCircle, Star, Package, Clock, User } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { transactionsService, reviewsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const txLabel: Record<string, string> = { Pending: 'Aguardando confirmação', ConfirmedByBuyer: 'Comprador confirmou', ConfirmedBySeller: 'Vendedor confirmou', Completed: 'Pagamento confirmado', Cancelled: 'Cancelada' };
const txColor: Record<string, string> = { Pending: 'eq-badge-warning', ConfirmedByBuyer: 'eq-badge-info', ConfirmedBySeller: 'eq-badge-info', Completed: 'eq-badge-success', Cancelled: 'eq-badge-error' };
const orderLabel: Record<string, string> = { OrderPlaced: 'Pedido realizado', PaymentConfirmed: 'Pagamento confirmado', Shipped: 'Enviado', Delivered: 'Entregue', Finished: 'Finalizado' };

const TransactionDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [tx, setTx] = createSignal<Transaction | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [actionLoading, setActionLoading] = createSignal(false);
  const [rating, setRating] = createSignal(5);
  const [comment, setComment] = createSignal('');
  const [reviewed, setReviewed] = createSignal(false);

  onMount(async () => {
    try {
      setTx(await transactionsService.getById(params.id));
    } catch { setError('Transação não encontrada.'); }
    finally { setLoading(false); }
  });

  const isBuyer = () => tx()?.buyerId === auth.currentUser()?.id;
  const otherName = () => isBuyer() ? tx()?.sellerName : tx()?.buyerName;
  const otherLabel = () => isBuyer() ? 'Vendedor' : 'Comprador';

  const action = async (fn: () => Promise<Transaction>) => {
    setActionLoading(true);
    try { setTx(await fn()); } catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  };

  const submitReview = async () => {
    setActionLoading(true);
    try {
      await reviewsService.create(params.id, rating(), comment() || undefined);
      setReviewed(true);
    } catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  };

  const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  // Timeline steps
  const steps = () => {
    const t = tx();
    if (!t) return [];
    const s: { label: string; done: boolean; date?: string }[] = [
      { label: 'Pedido criado', done: true, date: t.createdAt },
      { label: 'Comprador confirmou', done: !!t.buyerConfirmedAt, date: t.buyerConfirmedAt },
      { label: 'Vendedor confirmou', done: !!t.sellerConfirmedAt, date: t.sellerConfirmedAt },
    ];
    if (t.status === 'Completed') {
      s.push({ label: 'Pagamento liberado', done: !!t.paymentConfirmedAt, date: t.paymentConfirmedAt });
      s.push({ label: 'Enviado', done: !!t.shippedAt, date: t.shippedAt });
      s.push({ label: 'Entregue', done: !!t.deliveredAt, date: t.deliveredAt });
    }
    if (t.status === 'Cancelled') {
      s.push({ label: 'Cancelado', done: true, date: t.completedAt });
    }
    return s;
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-6"><ArrowLeft size={14} /> Voltar</button>

      {loading() ? <LoadingSpinner class="py-20" /> : error() && !tx() ? (
        <Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>{error()}</p></Card>
      ) : tx() ? (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div class="lg:col-span-2 space-y-4">
            <Card class="p-5">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  <Package size={20} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div class="flex-1 min-w-0">
                  <h1 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{tx()!.itemTitle}</h1>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class={`eq-badge ${txColor[tx()!.status]}`}>{txLabel[tx()!.status]}</span>
                    <Show when={tx()!.status === 'Completed'}><span class="eq-badge eq-badge-info">{orderLabel[tx()!.orderStatus] ?? tx()!.orderStatus}</span></Show>
                    <span class="eq-badge">{tx()!.itemType === 'Product' ? 'Produto' : 'Serviço'}</span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-2xl font-bold eq-accent">{tx()!.totalPrice}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>EQL</p>
                </div>
              </div>

              {/* Parties */}
              <div class="grid grid-cols-2 gap-3 pt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Comprador</p>
                  <button onClick={() => tx()!.buyerId && navigate(`/users/${tx()!.buyerId}`)} class="text-sm font-medium hover:underline eq-link">{tx()!.buyerName ?? '—'}</button>
                </div>
                <div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vendedor</p>
                  <button onClick={() => tx()!.sellerId && navigate(`/users/${tx()!.sellerId}`)} class="text-sm font-medium hover:underline eq-link">{tx()!.sellerName ?? '—'}</button>
                </div>
              </div>

              {/* Details */}
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Quantidade</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx()!.quantity}</p></div>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Preço unit.</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx()!.unitPrice} EQL</p></div>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Criado em</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{fmtDateTime(tx()!.createdAt)}</p></div>
                <div><Show when={tx()!.paymentConfirmedAt}><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pago em</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{fmtDateTime(tx()!.paymentConfirmedAt)}</p></Show></div>
              </div>
            </Card>

            {/* Timeline */}
            <Card class="p-5">
              <h3 class="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Histórico do pedido</h3>
              <div class="space-y-3">
                <For each={steps()}>{(step, i) => (
                  <div class="flex items-start gap-3">
                    <div class="flex flex-col items-center shrink-0">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center" style={step.done ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                        {step.done ? <Check size={12} /> : <Clock size={10} style={{ color: 'var(--color-text-muted)' }} />}
                      </div>
                      <Show when={i() < steps().length - 1}><div class="w-0.5 h-6 mt-1" style={{ background: step.done ? 'var(--color-primary)' : 'var(--color-border)' }}></div></Show>
                    </div>
                    <div>
                      <p class="text-sm font-medium" style={{ color: step.done ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{step.label}</p>
                      <Show when={step.date}><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDateTime(step.date)}</p></Show>
                    </div>
                  </div>
                )}</For>
              </div>
            </Card>
          </div>

          {/* Sidebar: actions + review */}
          <div class="space-y-4">
            {/* Actions */}
            <Show when={tx()!.status !== 'Completed' && tx()!.status !== 'Cancelled'}>
              <Card class="p-5">
                <h3 class="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Ações</h3>
                <div class="space-y-2">
                  <Show when={isBuyer() && (tx()!.status === 'Pending' || tx()!.status === 'ConfirmedBySeller')}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.confirmByBuyer(params.id))} disabled={actionLoading()}>
                      <Check size={14} class="mr-1" /> Confirmar pagamento
                    </Button>
                  </Show>
                  <Show when={!isBuyer() && (tx()!.status === 'Pending' || tx()!.status === 'ConfirmedByBuyer')}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.confirmBySeller(params.id))} disabled={actionLoading()}>
                      <Check size={14} class="mr-1" /> Confirmar recebimento
                    </Button>
                  </Show>
                  <Show when={tx()!.status === 'Completed' && tx()!.orderStatus === 'PaymentConfirmed' && !isBuyer()}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.markShipped(params.id))} disabled={actionLoading()}>
                      <Truck size={14} class="mr-1" /> Marcar como enviado
                    </Button>
                  </Show>
                  <Show when={tx()!.status === 'Completed' && tx()!.orderStatus === 'Shipped' && isBuyer()}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.markDelivered(params.id))} disabled={actionLoading()}>
                      <CheckCircle size={14} class="mr-1" /> Confirmar entrega
                    </Button>
                  </Show>
                  <Button variant="outline" class="w-full" size="sm" onClick={() => action(() => transactionsService.cancel(params.id))} disabled={actionLoading()} style={{ color: '#dc2626' }}>
                    <X size={14} class="mr-1" /> Cancelar transação
                  </Button>
                </div>
              </Card>
            </Show>

            {/* Review */}
            <Show when={tx()!.status === 'Completed'}>
              <Card class="p-5">
                <h3 class="flex items-center gap-1.5 font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}><Star size={14} class="eq-brand" /> Avaliar {otherLabel()}</h3>
                <Show when={!reviewed()} fallback={
                  <div class="text-center py-3"><CheckCircle size={24} class="mx-auto mb-2" style={{ color: '#059669' }} /><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Avaliação enviada!</p></div>
                }>
                  <div class="flex items-center gap-1 mb-3 justify-center">
                    <For each={[1, 2, 3, 4, 5]}>{(n) => (
                      <button onClick={() => setRating(n)} class="cursor-pointer p-0.5">
                        <Star size={24} style={{ color: n <= rating() ? '#f59e0b' : 'var(--color-border)' }} fill={n <= rating() ? '#f59e0b' : 'none'} />
                      </button>
                    )}</For>
                  </div>
                  <textarea value={comment()} onInput={(e) => setComment(e.currentTarget.value)} placeholder="Comentário (opcional)..." rows={2} class="eq-input text-sm resize-none mb-2 w-full" />
                  <Button class="w-full" size="sm" onClick={submitReview} disabled={actionLoading()}>
                    <Star size={14} class="mr-1" /> Enviar avaliação
                  </Button>
                </Show>
              </Card>
            </Show>

            {error() && <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TransactionDetailPage;
