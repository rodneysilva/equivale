import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Package, ChevronLeft, ChevronRight } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { api } from '../../services/api';
import type { Transaction } from '../../types';

const statusLabel: Record<string, string> = {
  OrderPlaced: 'Realizado',
  OrderConfirmed: 'Confirmado',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Finished: 'Finalizado',
  Cancelled: 'Cancelado',
};

const statusColor: Record<string, string> = {
  OrderPlaced: 'eq-badge-warning',
  OrderConfirmed: 'eq-badge-info',
  Shipped: 'eq-badge-info',
  Delivered: 'eq-badge-success',
  Finished: 'eq-badge-success',
  Cancelled: 'eq-badge-error',
};

interface BackendTransactionDto {
  id: string;
  buyerId: string;
  buyerName?: string | null;
  sellerId: string;
  sellerName?: string | null;
  itemType: string;
  itemId: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  shippingCost: number;
  totalPrice: number;
  status: string;
  trackingInfo?: string | null;
  deliveryAddress?: string | null;
  orderPlacedAt?: string | null;
  orderConfirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
}

interface BackendPagedResult<T> { items: T[]; totalItems: number; totalPages: number; page: number; pageSize: number; }

function mapTransaction(d: BackendTransactionDto): Transaction {
  return {
    id: d.id,
    buyerId: d.buyerId,
    buyerName: d.buyerName ?? undefined,
    sellerId: d.sellerId,
    sellerName: d.sellerName ?? undefined,
    itemType: d.itemType as 'Product' | 'Service',
    itemId: d.itemId,
    itemTitle: d.itemTitle,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
    shippingCost: d.shippingCost ?? 0,
    totalPrice: d.totalPrice,
    status: d.status as Transaction['status'],
    trackingInfo: d.trackingInfo ?? undefined,
    deliveryAddress: d.deliveryAddress ?? undefined,
    orderPlacedAt: d.orderPlacedAt ?? undefined,
    orderConfirmedAt: d.orderConfirmedAt ?? undefined,
    shippedAt: d.shippedAt ?? undefined,
    deliveredAt: d.deliveredAt ?? undefined,
    finishedAt: d.finishedAt ?? undefined,
    createdAt: d.createdAt,
  };
}

const AdminTransactionsPage: Component = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const pageSize = 20;

  const load = async (p: number) => {
    setLoading(true);
    try {
      const raw = await api.get<BackendPagedResult<BackendTransactionDto>>(`/transactions?page=${p}&pageSize=${pageSize}`);
      setTransactions(raw.items.map(mapTransaction));
      setTotalPages(raw.totalPages);
      setPage(raw.page);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  onMount(() => load(1));

  const prevPage = () => page() > 1 && load(page() - 1);
  const nextPage = () => page() < totalPages() && load(page() + 1);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Transações</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : transactions().length === 0 ? (
        <Card class="p-8 text-center">
          <Package size={28} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma transação encontrada.</p>
        </Card>
      ) : (
        <div class="space-y-2">
          <For each={transactions()}>
            {(t) => (
              <Card class="p-3 flex items-center gap-3">
                <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  <Package size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</span>
                    <span class={`eq-badge ${statusColor[t.status] || 'eq-badge-info'}`}>
                      {statusLabel[t.status] || t.status}
                    </span>
                  </div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Comprador: {t.buyerName || '—'} · Vendedor: {t.sellerName || '—'} · {formatDate(t.createdAt)}
                  </p>
                  <p class="text-sm font-semibold eq-accent">{t.totalPrice} EQL</p>
                </div>
              </Card>
            )}
          </For>

          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={page() <= 1}>
                <ChevronLeft size={14} class="mr-1" /> Anterior
              </Button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Pág. {page()} de {totalPages()}</span>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={page() >= totalPages()}>
                Próxima <ChevronRight size={14} class="ml-1" />
              </Button>
            </div>
          </Show>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
