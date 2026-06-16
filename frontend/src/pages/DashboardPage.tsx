import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Package, Zap, ShoppingCart, TrendingUp, Edit, Trash2, Pause, Play, Wallet, Clock, AlertCircle } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { transactionsService } from '../services/transactions.service';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { Product, Service, Transaction } from '../types';

const orderLabel: Record<string, string> = {
  OrderPlaced: 'Pedido criado',
  OrderConfirmed: 'Vendedor confirmou',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Finished: 'Finalizado',
  Cancelled: 'Cancelada',
};
const orderColor: Record<string, string> = {
  OrderPlaced: 'eq-badge-warning',
  OrderConfirmed: 'eq-badge-info',
  Shipped: 'eq-badge-info',
  Delivered: 'eq-badge-success',
  Finished: 'eq-badge-success',
  Cancelled: 'eq-badge-error',
};

function StatusIcon(props: { active: boolean }) {
  return <Show when={props.active} fallback={<Play size={14} />}><Pause size={14} /></Show>;
}

const DashboardPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [tab, setTab] = createSignal<'overview' | 'products' | 'services' | 'buys' | 'sells'>('overview');
  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [buys, setBuys] = createSignal<Transaction[]>([]);
  const [sells, setSells] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [dataLoaded, setDataLoaded] = createSignal(false);

  const userId = () => auth.currentUser()?.id;

  onMount(async () => {
    // Wait for auth to finish loading
    let waited = 0;
    while (auth.isLoading() && waited < 5000) {
      await new Promise(r => setTimeout(r, 100));
      waited += 100;
    }
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    await loadData();
  });

  const loadData = async () => {
    setLoading(true);
    const uid = userId();
    if (!uid) { setLoading(false); return; }
    try {
      const [p, s, b, sel] = await Promise.all([
        productsService.getAll(1, 50, undefined, undefined, undefined, uid),
        servicesService.getAll(1, 50, undefined, undefined, undefined, uid),
        transactionsService.getAll('buyer', 1, 50),
        transactionsService.getAll('seller', 1, 50),
      ]);
      setProducts(p.data);
      setServices(s.data);
      setBuys(b.data);
      setSells(sel.data);
      setDataLoaded(true);
    } catch {
      toast.error('Não foi possível carregar o painel.');
    } finally {
      setLoading(false);
    }
  };

  const pendingActions = (): { tx: Transaction; action: string; isBuyer: boolean }[] => {
    const uid = userId();
    if (!uid) return [];
    const all = [...buys(), ...sells()];
    const result: { tx: Transaction; action: string; isBuyer: boolean }[] = [];
    for (const t of all) {
      if (t.status === 'Finished' || t.status === 'Cancelled') continue;
      const isBuyer = t.buyerId === uid;
      let action = '';
      if (t.status === 'OrderPlaced' && !isBuyer) action = 'Confirmar pedido';
      else if (t.status === 'OrderConfirmed' && !isBuyer) action = 'Confirmar envio';
      else if (t.status === 'Shipped' && isBuyer) action = 'Confirmar entrega';
      else if (t.status === 'Delivered' && isBuyer) action = 'Avaliar e finalizar';
      if (action) result.push({ tx: t, action, isBuyer });
    }
    return result;
  };

  const toggleProductStatus = async (p: Product) => {
    const prevStatus = p.status;
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'available' ? 'sold' : 'available' } : x));
    try { await api.put(`/products/${p.id}`, { status: prevStatus === 'available' ? 'sold' : 'available' }); toast.success('Produto atualizado.'); }
    catch { setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: prevStatus } : x)); toast.error('Falha ao atualizar. Tente novamente.'); }
  };
  const deleteProduct = async (id: string) => {
    const prevProducts = products();
    setProducts(prev => prev.filter(p => p.id !== id));
    try { await api.del(`/products/${id}`); toast.success('Produto excluído.'); }
    catch { setProducts(prevProducts); toast.error('Falha ao excluir. Tente novamente.'); }
  };
  const toggleServiceStatus = async (svc: Service) => {
    const prevStatus = svc.status;
    setServices(prev => prev.map(x => x.id === svc.id ? { ...x, status: x.status === 'available' ? 'pending_moderation' : 'available' } : x));
    try { await api.put(`/services/${svc.id}`, { status: prevStatus === 'available' ? 'pending_moderation' : 'available' }); toast.success('Serviço atualizado.'); }
    catch { setServices(prev => prev.map(x => x.id === svc.id ? { ...x, status: prevStatus } : x)); toast.error('Falha ao atualizar. Tente novamente.'); }
  };
  const deleteService = async (id: string) => {
    const prevServices = services();
    setServices(prev => prev.filter(s => s.id !== id));
    try { await api.del(`/services/${id}`); toast.success('Serviço excluído.'); }
    catch { setServices(prevServices); toast.error('Falha ao excluir. Tente novamente.'); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Painel</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/products/new')}>
            <Package size={14} class="mr-1" /> Novo produto
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/services/new')}>
            <Zap size={14} class="mr-1" /> Novo serviço
          </Button>
        </div>
      </div>

      {/* Pending actions */}
      <Show when={dataLoaded() && pendingActions().length > 0}>
        <Card class="p-4 mb-6" style={{ 'border-color': '#f59e0b', 'border-width': '2px' }}>
          <div class="flex items-center gap-2 mb-3">
            <AlertCircle size={18} style={{ color: '#f59e0b' }} />
            <h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Ações pendentes ({pendingActions().length})
            </h3>
          </div>
          <div class="space-y-2">
            <For each={pendingActions()}>
              {(item) => (
                <div class="flex items-center gap-3 p-2 rounded" style={{ background: 'var(--color-surface-alt)' }}>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.tx.itemTitle}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {item.isBuyer ? 'Compra' : 'Venda'} · {item.action}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/transactions/${item.tx.id}`)}
                    class="text-xs px-3 py-1 rounded font-medium whitespace-nowrap cursor-pointer"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}
                  >
                    Agir agora
                  </button>
                </div>
              )}
            </For>
          </div>
        </Card>
      </Show>

      {/* Tabs */}
      <div class="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setTab('overview')} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap cursor-pointer"
          style={tab() === 'overview' ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
          <TrendingUp size={14} /> Visão Geral
        </button>
        <button onClick={() => setTab('products')} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap cursor-pointer"
          style={tab() === 'products' ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
          <Package size={14} /> Produtos {dataLoaded() ? `(${products().length})` : ''}
        </button>
        <button onClick={() => setTab('services')} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap cursor-pointer"
          style={tab() === 'services' ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
          <Zap size={14} /> Serviços {dataLoaded() ? `(${services().length})` : ''}
        </button>
        <button onClick={() => setTab('buys')} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap cursor-pointer"
          style={tab() === 'buys' ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
          <ShoppingCart size={14} /> Compras {dataLoaded() ? `(${buys().length})` : ''}
        </button>
        <button onClick={() => setTab('sells')} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap cursor-pointer"
          style={tab() === 'sells' ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
          <Wallet size={14} /> Vendas {dataLoaded() ? `(${sells().length})` : ''}
        </button>
      </div>

      <Show when={loading()}>
        <LoadingSpinner class="py-20" />
      </Show>

      <Show when={!loading() && tab() === 'overview'}>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card class="p-4"><Package size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{products().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos</p></Card>
          <Card class="p-4"><Zap size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{services().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Serviços</p></Card>
          <Card class="p-4"><ShoppingCart size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{buys().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Compras</p></Card>
          <Card class="p-4"><Wallet size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold eq-accent">{auth.currentUser()?.walletBalance ?? 0}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>EQL</p></Card>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div class="flex items-center justify-between mb-3"><h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Vendas recentes</h3><button onClick={() => setTab('sells')} class="text-xs eq-link">Ver todas</button></div>
            <Show when={sells().length > 0} fallback={<Card class="p-4 text-center"><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma venda ainda</p></Card>}>
              <div class="space-y-2"><For each={sells().slice(0, 4)}>{(t) => (
                <Card hover class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/transactions/${t.id}`)}>
                  <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.buyerName} · {fmtDate(t.createdAt)}</p></div>
                  <span class={`eq-badge ${orderColor[t.status]}`}>{orderLabel[t.status]}</span><span class="text-sm font-bold eq-accent">+{t.totalPrice}</span>
                </Card>
              )}</For></div>
            </Show>
          </div>
          <div>
            <div class="flex items-center justify-between mb-3"><h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Compras recentes</h3><button onClick={() => setTab('buys')} class="text-xs eq-link">Ver todas</button></div>
            <Show when={buys().length > 0} fallback={<Card class="p-4 text-center"><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma compra ainda</p></Card>}>
              <div class="space-y-2"><For each={buys().slice(0, 4)}>{(t) => (
                <Card hover class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/transactions/${t.id}`)}>
                  <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.sellerName} · {fmtDate(t.createdAt)}</p></div>
                  <span class={`eq-badge ${orderColor[t.status]}`}>{orderLabel[t.status]}</span><span class="text-sm font-bold" style={{ color: '#dc2626' }}>-{t.totalPrice}</span>
                </Card>
              )}</For></div>
            </Show>
          </div>
        </div>
      </Show>

      <Show when={!loading() && tab() === 'products'}>
        <Show when={products().length > 0} fallback={<Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>Nenhum produto publicado.</p></Card>}>
          <div class="space-y-2"><For each={products()}>{(p) => (
            <Card class="p-3 flex items-center gap-3">
              <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                <Show when={p.imageUrl}><img src={p.imageUrl} class="w-full h-full object-cover" /></Show>
              </div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.title}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.category} · {p.price} EQL · Stock: {p.stock ?? 1}</p></div>
              <span class="eq-badge shrink-0" style={{ background: p.status === 'available' ? '#dcfce7' : '#fee2e2', color: p.status === 'available' ? '#166534' : '#991b1b' }}>{p.status === 'available' ? 'Ativo' : 'Inativo'}</span>
              <div class="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleProductStatus(p)} class="eq-btn-ghost p-1.5 rounded cursor-pointer"><StatusIcon active={p.status === 'available'} /></button>
                <button onClick={() => navigate(`/products/${p.id}`)} class="eq-btn-ghost p-1.5 rounded cursor-pointer"><Edit size={14} /></button>
                <button onClick={() => deleteProduct(p.id)} class="eq-btn-ghost p-1.5 rounded cursor-pointer" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
              </div>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      <Show when={!loading() && tab() === 'services'}>
        <Show when={services().length > 0} fallback={<Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>Nenhum serviço publicado.</p></Card>}>
          <div class="space-y-2"><For each={services()}>{(svc) => (
            <Card class="p-3 flex items-center gap-3">
              <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                <Show when={svc.imageUrl}><img src={svc.imageUrl} class="w-full h-full object-cover" /></Show>
              </div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{svc.title}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{svc.category} · {svc.price} EQL</p></div>
              <span class="eq-badge shrink-0" style={{ background: svc.status === 'available' ? '#dcfce7' : '#fee2e2', color: svc.status === 'available' ? '#166534' : '#991b1b' }}>{svc.status === 'available' ? 'Ativo' : 'Inativo'}</span>
              <div class="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleServiceStatus(svc)} class="eq-btn-ghost p-1.5 rounded cursor-pointer"><StatusIcon active={svc.status === 'available'} /></button>
                <button onClick={() => navigate(`/services/${svc.id}`)} class="eq-btn-ghost p-1.5 rounded cursor-pointer"><Edit size={14} /></button>
                <button onClick={() => deleteService(svc.id)} class="eq-btn-ghost p-1.5 rounded cursor-pointer" style={{ color: '#dc2626' }}><Trash2 size={14} /></button>
              </div>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      <Show when={!loading() && tab() === 'buys'}>
        <Show when={buys().length > 0} fallback={<Card class="p-8 text-center"><Clock size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p style={{ color: 'var(--color-text-muted)' }}>Nenhuma compra.</p></Card>}>
          <div class="space-y-2"><For each={buys()}>{(t) => (
            <Card hover class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/transactions/${t.id}`)}>
              <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}><ShoppingCart size={14} style={{ color: 'var(--color-text-muted)' }} /></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>De: {t.sellerName} · {fmtDate(t.createdAt)}</p></div>
              <span class={`eq-badge ${orderColor[t.status]}`}>{orderLabel[t.status]}</span><span class="text-sm font-bold" style={{ color: '#dc2626' }}>-{t.totalPrice}</span>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      <Show when={!loading() && tab() === 'sells'}>
        <Show when={sells().length > 0} fallback={<Card class="p-8 text-center"><Clock size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p style={{ color: 'var(--color-text-muted)' }}>Nenhuma venda.</p></Card>}>
          <div class="space-y-2"><For each={sells()}>{(t) => (
            <Card hover class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/transactions/${t.id}`)}>
              <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}><Wallet size={14} style={{ color: 'var(--color-text-muted)' }} /></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Para: {t.buyerName} · {fmtDate(t.createdAt)}</p></div>
              <span class={`eq-badge ${orderColor[t.status]}`}>{orderLabel[t.status]}</span><span class="text-sm font-bold eq-accent">+{t.totalPrice}</span>
            </Card>
          )}</For></div>
        </Show>
      </Show>
    </div>
  );
};

export default DashboardPage;
