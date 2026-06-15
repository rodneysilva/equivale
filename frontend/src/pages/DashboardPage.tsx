import { type Component, createSignal, onMount, For, Show, createEffect, on } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Package, Zap, ShoppingCart, TrendingUp, Edit, Trash2, Pause, Play, Wallet, ArrowRight, Clock } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { transactionsService } from '../services/transactions.service';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import type { Product, Service, Transaction } from '../types';

const txLabel: Record<string, string> = { Pending: 'Pendente', ConfirmedByBuyer: 'Comprador confirmou', ConfirmedBySeller: 'Vendedor confirmou', Completed: 'Concluída', Cancelled: 'Cancelada' };
const txColor: Record<string, string> = { Pending: 'eq-badge-warning', ConfirmedByBuyer: 'eq-badge-info', ConfirmedBySeller: 'eq-badge-info', Completed: 'eq-badge-success', Cancelled: 'eq-badge-error' };

const DashboardPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [tab, setTab] = createSignal<'overview' | 'products' | 'services' | 'buys' | 'sells'>('overview');
  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [buys, setBuys] = createSignal<Transaction[]>([]);
  const [sells, setSells] = createSignal<Transaction[]>([]);
  const [loading, setLoading] = createSignal(true);

  const userId = () => auth.currentUser()?.id;

  onMount(async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    try {
      const [p, s, b, sel] = await Promise.all([
        productsService.getAll(1, 50, undefined, undefined, undefined, userId()),
        servicesService.getAll(1, 50, undefined, undefined, undefined, userId()),
        transactionsService.getAll('buyer', 1, 20),
        transactionsService.getAll('seller', 1, 20),
      ]);
      setProducts(p.data);
      setServices(s.data);
      setBuys(b.data);
      setSells(sel.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const toggleProductStatus = async (p: Product) => {
    try {
      await api.put(`/products/${p.id}`, { status: p.status === 'available' ? 'sold' : 'available' });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'available' ? 'sold' : 'available' } : x));
    } catch { /* ignore */ }
  };

  const deleteProduct = async (id: string) => {
    try { await api.del(`/products/${id}`); setProducts(prev => prev.filter(p => p.id !== id)); } catch { /* ignore */ }
  };

  const toggleServiceStatus = async (s: Service) => {
    try {
      await api.put(`/services/${s.id}`, { status: s.status === 'available' ? 'pending_moderation' : 'available' });
      setServices(prev => prev.map(x => x.id === s.id ? { ...x, status: x.status === 'available' ? 'pending_moderation' : 'available' } : x));
    } catch { /* ignore */ }
  };

  const deleteService = async (id: string) => {
    try { await api.del(`/services/${id}`); setServices(prev => prev.filter(s => s.id !== id)); } catch { /* ignore */ }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: TrendingUp },
    { id: 'products' as const, label: `Produtos (${products().length})`, icon: Package },
    { id: 'services' as const, label: `Serviços (${services().length})`, icon: Zap },
    { id: 'buys' as const, label: `Compras (${buys().length})`, icon: ShoppingCart },
    { id: 'sells' as const, label: `Vendas (${sells().length})`, icon: Wallet },
  ];

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Painel</h1>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/products/new')}><Package size={14} class="mr-1" /> Novo produto</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/services/new')}><Zap size={14} class="mr-1" /> Novo serviço</Button>
        </div>
      </div>

      {/* Tabs */}
      <div class="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        <For each={tabs}>{(t) => (
          <button onClick={() => setTab(t.id)} class="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
            style={tab() === t.id ? { background: 'var(--color-primary)', color: 'var(--color-surface)' } : { color: 'var(--color-text-secondary)' }}>
            <t.icon size={14} /> {t.label}
          </button>
        )}</For>
      </div>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <Show when={tab() === 'overview'}>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card class="p-4"><Package size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{products().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos ativos</p></Card>
            <Card class="p-4"><Zap size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{services().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Serviços ativos</p></Card>
            <Card class="p-4"><ShoppingCart size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{buys().length}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Compras</p></Card>
            <Card class="p-4"><Wallet size={18} class="eq-brand mb-1" /><p class="text-2xl font-bold eq-accent">{auth.currentUser()?.walletBalance ?? 0}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>EQL disponível</p></Card>
          </div>

          {/* Resumo de vendas recentes */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div class="flex items-center justify-between mb-3"><h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Vendas recentes</h3><button onClick={() => setTab('sells')} class="text-xs eq-link">Ver todas</button></div>
              <Show when={sells().length > 0} fallback={<Card class="p-4 text-center"><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma venda ainda</p></Card>}>
                <div class="space-y-2"><For each={sells().slice(0, 3)}>{(t) => (
                  <Card class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/transactions')}>
                    <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.buyerName} · {fmtDate(t.createdAt)}</p></div>
                    <span class={`eq-badge ${txColor[t.status]}`}>{txLabel[t.status]}</span>
                    <span class="text-sm font-bold eq-accent">{t.totalPrice}</span>
                  </Card>
                )}</For></div>
              </Show>
            </div>
            <div>
              <div class="flex items-center justify-between mb-3"><h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Compras recentes</h3><button onClick={() => setTab('buys')} class="text-xs eq-link">Ver todas</button></div>
              <Show when={buys().length > 0} fallback={<Card class="p-4 text-center"><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhuma compra ainda</p></Card>}>
                <div class="space-y-2"><For each={buys().slice(0, 3)}>{(t) => (
                  <Card class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/transactions')}>
                    <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.sellerName} · {fmtDate(t.createdAt)}</p></div>
                    <span class={`eq-badge ${txColor[t.status]}`}>{txLabel[t.status]}</span>
                    <span class="text-sm font-bold eq-accent">{t.totalPrice}</span>
                  </Card>
                )}</For></div>
              </Show>
            </div>
          </div>
        </Show>
      )}

      {/* Products tab */}
      <Show when={!loading() && tab() === 'products'}>
        <Show when={products().length > 0} fallback={<Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>Nenhum produto publicado.</p></Card>}>
          <div class="space-y-2"><For each={products()}>{(p) => (
            <Card class="p-3 flex items-center gap-3">
              <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>{p.imageUrl && <img src={p.imageUrl} class="w-full h-full object-cover" />}</div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.title}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.category} · {p.price} EQL · Stock: {p.stock ?? 1} · <span style={{ color: p.status === 'available' ? '#059669' : '#dc2626' }}>{p.status === 'available' ? 'Ativo' : 'Pausado'}</span></p></div>
              <div class="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleProductStatus(p)} class="eq-btn-ghost p-1.5 rounded" title={p.status === 'available' ? 'Pausar' : 'Ativar'}>{p.status === 'available' ? <Pause size={14} /> : <Play size={14} />}</button>
                <button onClick={() => navigate(`/products/${p.id}`)} class="eq-btn-ghost p-1.5 rounded" title="Ver"><Edit size={14} /></button>
                <button onClick={() => deleteProduct(p.id)} class="eq-btn-ghost p-1.5 rounded" style={{ color: '#dc2626' }} title="Excluir"><Trash2 size={14} /></button>
              </div>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      {/* Services tab */}
      <Show when={!loading() && tab() === 'services'}>
        <Show when={services().length > 0} fallback={<Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>Nenhum serviço publicado.</p></Card>}>
          <div class="space-y-2"><For each={services()}>{(s) => (
            <Card class="p-3 flex items-center gap-3">
              <div class="w-12 h-12 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary-light)' }}><Zap size={16} class="eq-brand" /></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{s.title}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.category} · {s.price} EQL · <span style={{ color: s.status === 'available' ? '#059669' : '#dc2626' }}>{s.status === 'available' ? 'Ativo' : 'Pausado'}</span></p></div>
              <div class="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleServiceStatus(s)} class="eq-btn-ghost p-1.5 rounded" title={s.status === 'available' ? 'Pausar' : 'Ativar'}>{s.status === 'available' ? <Pause size={14} /> : <Play size={14} />}</button>
                <button onClick={() => navigate(`/services/${s.id}`)} class="eq-btn-ghost p-1.5 rounded" title="Ver"><Edit size={14} /></button>
                <button onClick={() => deleteService(s.id)} class="eq-btn-ghost p-1.5 rounded" style={{ color: '#dc2626' }} title="Excluir"><Trash2 size={14} /></button>
              </div>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      {/* Buys tab */}
      <Show when={!loading() && tab() === 'buys'}>
        <Show when={buys().length > 0} fallback={<Card class="p-8 text-center"><Clock size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p style={{ color: 'var(--color-text-muted)' }}>Nenhuma compra realizada.</p></Card>}>
          <div class="space-y-2"><For each={buys()}>{(t) => (
            <Card class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/transactions')}>
              <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}><ShoppingCart size={14} style={{ color: 'var(--color-text-muted)' }} /></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>De: {t.sellerName} · {fmtDate(t.createdAt)}</p></div>
              <span class={`eq-badge ${txColor[t.status]}`}>{txLabel[t.status]}</span>
              <span class="text-sm font-bold eq-accent">{t.totalPrice} EQL</span>
            </Card>
          )}</For></div>
        </Show>
      </Show>

      {/* Sells tab */}
      <Show when={!loading() && tab() === 'sells'}>
        <Show when={sells().length > 0} fallback={<Card class="p-8 text-center"><Clock size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} /><p style={{ color: 'var(--color-text-muted)' }}>Nenhuma venda realizada.</p></Card>}>
          <div class="space-y-2"><For each={sells()}>{(t) => (
            <Card class="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/transactions')}>
              <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}><Wallet size={14} style={{ color: 'var(--color-text-muted)' }} /></div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Para: {t.buyerName} · {fmtDate(t.createdAt)}</p></div>
              <span class={`eq-badge ${txColor[t.status]}`}>{txLabel[t.status]}</span>
              <span class="text-sm font-bold eq-accent">{t.totalPrice} EQL</span>
            </Card>
          )}</For></div>
        </Show>
      </Show>
    </div>
  );
};

export default DashboardPage;
