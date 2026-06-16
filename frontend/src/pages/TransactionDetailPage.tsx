import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Check, X, Truck, CheckCircle, Star, Package, Clock, MapPin, MessageCircle } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { transactionsService, reviewsService } from '../services/transactions.service';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import type { Transaction } from '../types';

const statusLabel: Record<string, string> = {
  OrderPlaced: 'Pedido criado',
  OrderConfirmed: 'Vendedor confirmou',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Finished: 'Finalizado',
  Cancelled: 'Cancelada',
};
const statusColor: Record<string, string> = {
  OrderPlaced: 'eq-badge-warning',
  OrderConfirmed: 'eq-badge-info',
  Shipped: 'eq-badge-info',
  Delivered: 'eq-badge-success',
  Finished: 'eq-badge-success',
  Cancelled: 'eq-badge-error',
};

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
  const [reviewRating, setReviewRating] = createSignal(5);
  const [reviewComment, setReviewComment] = createSignal('');
  const [reviewSubmitting, setReviewSubmitting] = createSignal(false);
  const [reviewSubmitted, setReviewSubmitted] = createSignal(false);
  const [trackingInput, setTrackingInput] = createSignal('');
  const [showShipForm, setShowShipForm] = createSignal(false);

  onMount(async () => {
    try { setTx(await transactionsService.getById(params.id)); }
    catch { setError('Transação não encontrada.'); }
    finally { setLoading(false); }
  });

  const isBuyer = () => tx()?.buyerId === auth.currentUser()?.id;
  const isSeller = () => tx()?.sellerId === auth.currentUser()?.id;

  const action = async (fn: () => Promise<Transaction>) => {
    setActionLoading(true);
    try {
      setTx(await fn());
      setError('');
      // Refresh profile to update wallet balance in navbar
      if (auth.refreshProfile) await auth.refreshProfile();
    } catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  };

  const submitReview = async () => {
    setActionLoading(true);
    try {
      await reviewsService.create(params.id, rating(), comment() || undefined);
      setReviewed(true);
      setTx(await transactionsService.getById(params.id));
      if (auth.refreshProfile) await auth.refreshProfile();
    } catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  };

  const handleSubmitReview = async () => {
    const t = tx();
    if (!t) return;
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        reviewerId: auth.currentUser()!.id,
        targetUserId: t.buyerId === auth.currentUser()!.id ? t.sellerId : t.buyerId,
        itemId: t.itemId,
        itemType: t.itemType || 'Product',
        rating: reviewRating(),
        comment: reviewComment().trim() || undefined,
      });
      setReviewSubmitted(true);
    } catch (err: any) {
      console.error('Review error:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const steps = () => {
    const t = tx();
    if (!t) return [];
    const s: { label: string; done: boolean; date?: string }[] = [
      { label: 'Pedido criado', done: true, date: t.createdAt },
    ];
    if (t.status !== 'Cancelled') {
      s.push({ label: 'Vendedor confirmou', done: !!t.orderConfirmedAt, date: t.orderConfirmedAt });
      s.push({ label: 'Enviado', done: !!t.shippedAt, date: t.shippedAt });
      s.push({ label: 'Entregue', done: !!t.deliveredAt, date: t.deliveredAt });
      s.push({ label: 'Finalizado', done: !!t.finishedAt, date: t.finishedAt });
    } else {
      s.push({ label: 'Cancelado', done: true, date: t.createdAt });
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
          {/* Main */}
          <div class="lg:col-span-2 space-y-4">
            <Card class="p-5">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  <Package size={20} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div class="flex-1 min-w-0">
                  <h1 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{tx()!.itemTitle}</h1>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class={`eq-badge ${statusColor[tx()!.status]}`}>{statusLabel[tx()!.status]}</span>
                    <span class="eq-badge">{tx()!.itemType === 'Product' ? 'Produto' : 'Serviço'}</span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-2xl font-bold eq-accent">{tx()!.totalPrice}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>EQL total</p>
                </div>
              </div>

              {/* Parties */}
              <div class="grid grid-cols-2 gap-3 pt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Comprador</p>
                  <button onClick={() => navigate(`/users/${tx()!.buyerId}`)} class="text-sm font-medium eq-link">{tx()!.buyerName ?? '—'}</button>
                </div>
                <div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vendedor</p>
                  <button onClick={() => navigate(`/users/${tx()!.sellerId}`)} class="text-sm font-medium eq-link">{tx()!.sellerName ?? '—'}</button>
                </div>
              </div>

              {/* Details */}
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Quantidade</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx()!.quantity}</p></div>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Preço unit.</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx()!.unitPrice} EQL</p></div>
                <Show when={tx()!.shippingCost && tx()!.shippingCost! > 0}>
                  <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Frete</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx()!.shippingCost} EQL</p></div>
                </Show>
                <div><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Criado em</p><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{fmtDateTime(tx()!.createdAt)}</p></div>
              </div>

              {/* Delivery address (visible to seller) */}
              <Show when={isSeller() && tx()!.deliveryAddress}>
                <div class="pt-3 mt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                  <p class="text-xs flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-muted)' }}><MapPin size={11} /> Endereço de entrega</p>
                  <p class="text-sm" style={{ color: 'var(--color-text)' }}>{tx()!.deliveryAddress}</p>
                </div>
              </Show>

              {/* Tracking info */}
              <Show when={tx()!.trackingInfo}>
                <div class="pt-3 mt-3" style={{ 'border-top': '1px solid var(--color-border)' }}>
                  <p class="text-xs flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-muted)' }}><Truck size={11} /> Rastreio</p>
                  <p class="text-sm font-mono" style={{ color: 'var(--color-text)' }}>{tx()!.trackingInfo}</p>
                </div>
              </Show>
            </Card>

            {/* Review creation */}
            <Show when={tx()?.status === 'Delivered' && !reviewSubmitted()}>
              <Card class="p-4 mt-4">
                <h3 class="text-sm font-semibold mb-3 eq-text">Avaliar esta transação</h3>
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs eq-text-muted">Nota:</span>
                  <StarRating rating={reviewRating()} size={20} />
                  <select value={reviewRating()} onChange={(e) => setReviewRating(Number(e.currentTarget.value))} class="eq-input w-16 text-sm">
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <textarea value={reviewComment()} onInput={(e) => setReviewComment(e.currentTarget.value)} placeholder="Comentário (opcional)" rows={2} class="eq-input resize-none text-sm mb-3" />
                <button onClick={handleSubmitReview} disabled={reviewSubmitting()} class="eq-btn eq-btn-sm">
                  {reviewSubmitting() ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </Card>
            </Show>

            {/* Timeline */}
            <Card class="p-5">
              <h3 class="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Histórico</h3>
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

          {/* Sidebar: actions */}
          <div class="space-y-4">
            <Show when={tx()!.status !== 'Cancelled' && tx()!.status !== 'Finished'}>
              <Card class="p-4">
                <Button variant="outline" class="w-full" size="sm" onClick={() => navigate(`/transactions/${params.id}/chat`)}>
                  <MessageCircle size={14} class="mr-1" /> Abrir chat
                </Button>
              </Card>
            </Show>
            {/* Seller actions */}
            <Show when={isSeller() && tx()!.status !== 'Finished' && tx()!.status !== 'Cancelled'}>
              <Card class="p-5">
                <h3 class="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Ações do vendedor</h3>
                <div class="space-y-2">
                  <Show when={tx()!.status === 'OrderPlaced'}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.sellerConfirmOrder(params.id))} disabled={actionLoading()}>
                      <Check size={14} class="mr-1" /> Confirmar pedido
                    </Button>
                  </Show>
                  <Show when={tx()!.status === 'OrderConfirmed'}>
                    <Show when={!showShipForm()} fallback={
                      <div class="space-y-2">
                        <input type="text" value={trackingInput()} onInput={(e) => setTrackingInput(e.currentTarget.value)} placeholder="Código de rastreio (opcional)" class="eq-input text-sm" />
                        <div class="flex gap-2">
                          <Button class="flex-1" size="sm" onClick={() => action(() => transactionsService.sellerShip(params.id, trackingInput() || undefined)).then(() => setShowShipForm(false))} disabled={actionLoading()}>
                            Confirmar envio
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowShipForm(false)}>Cancelar</Button>
                        </div>
                      </div>
                    }>
                      <Button class="w-full" size="sm" onClick={() => setShowShipForm(true)}>
                        <Truck size={14} class="mr-1" /> Marcar como enviado
                      </Button>
                    </Show>
                  </Show>
                  <Button variant="outline" class="w-full" size="sm" onClick={() => action(() => transactionsService.cancel(params.id))} disabled={actionLoading()} style={{ color: '#dc2626' }}>
                    <X size={14} class="mr-1" /> Cancelar
                  </Button>
                </div>
              </Card>
            </Show>

            {/* Buyer actions */}
            <Show when={isBuyer() && tx()!.status !== 'Finished' && tx()!.status !== 'Cancelled'}>
              <Card class="p-5">
                <h3 class="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Ações do comprador</h3>
                <div class="space-y-2">
                  <Show when={tx()!.status === 'Shipped'}>
                    <Button class="w-full" size="sm" onClick={() => action(() => transactionsService.buyerConfirmDelivery(params.id))} disabled={actionLoading()}>
                      <CheckCircle size={14} class="mr-1" /> Confirmar entrega
                    </Button>
                  </Show>
                  <Show when={tx()!.status === 'OrderPlaced' || tx()!.status === 'OrderConfirmed'}>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Aguardando o vendedor processar o pedido...</p>
                  </Show>
                  <Button variant="outline" class="w-full" size="sm" onClick={() => action(() => transactionsService.cancel(params.id))} disabled={actionLoading()} style={{ color: '#dc2626' }}>
                    <X size={14} class="mr-1" /> Cancelar
                  </Button>
                </div>
              </Card>
            </Show>

            {/* Review (buyer only, after delivery) */}
            <Show when={isBuyer() && tx()!.status === 'Delivered'}>
              <Card class="p-5">
                <h3 class="flex items-center gap-1.5 font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
                  <Star size={14} class="eq-brand" /> Avaliar e finalizar
                </h3>
                <Show when={!reviewed() && tx()!.status !== 'Finished'} fallback={
                  <div class="text-center py-3"><CheckCircle size={24} class="mx-auto mb-2" style={{ color: '#059669' }} /><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Avaliação enviada! Pagamento liberado.</p></div>
                }>
                  <p class="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>A avaliação libera o pagamento ao vendedor.</p>
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

            {/* Finished info */}
            <Show when={tx()!.status === 'Finished'}>
              <Card class="p-5 text-center">
                <CheckCircle size={28} class="mx-auto mb-2" style={{ color: '#059669' }} />
                <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Transação finalizada</p>
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Pagamento liberado ao vendedor</p>
              </Card>
            </Show>

            {/* Cancelled info */}
            <Show when={tx()!.status === 'Cancelled'}>
              <Card class="p-5 text-center">
                <X size={28} class="mx-auto mb-2" style={{ color: '#dc2626' }} />
                <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Transação cancelada</p>
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Valor estornado ao comprador</p>
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
