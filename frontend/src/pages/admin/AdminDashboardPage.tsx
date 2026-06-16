import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Users, Package, Zap, Globe, TrendingUp, Shield, Clock, ChevronRight, Coins, BarChart3, ShieldAlert } from 'lucide-solid';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService, type AdminStats } from '../../services/admin.service';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';
import type { Transaction } from '../../types';

const AdminDashboardPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [stats, setStats] = createSignal<AdminStats | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [recentTransactions, setRecentTransactions] = createSignal<Transaction[]>([]);

  onMount(async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    try {
      const [s, txRaw] = await Promise.all([
        adminService.getStats(),
        api.get<{ items: Transaction[] }>('/transactions?page=1&pageSize=5'),
      ]);
      setStats(s);
      setRecentTransactions(txRaw.items || []);
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
      navigate('/');
    }
    finally { setLoading(false); }
  });

  const statusLabel: Record<string, string> = {
    OrderPlaced: 'Realizado', OrderConfirmed: 'Confirmado', Shipped: 'Enviado',
    Delivered: 'Entregue', Finished: 'Finalizado', Cancelled: 'Cancelado',
  };

  const statusColor: Record<string, string> = {
    OrderPlaced: 'eq-badge-warning', OrderConfirmed: 'eq-badge-info', Shipped: 'eq-badge-info',
    Delivered: 'eq-badge-success', Finished: 'eq-badge-success', Cancelled: 'eq-badge-error',
  };

  const statCards = () => {
    const s = stats();
    if (!s) return [];
    return [
      { label: 'Usuários', value: s.users, icon: Users, link: '/admin/users', color: 'var(--color-primary)' },
      { label: 'Produtos', value: s.products, icon: Package, link: '/admin/products', color: 'var(--color-accent)' },
      { label: 'Serviços', value: s.services, icon: Zap, link: '/admin/services', color: '#0891b2' },
      { label: 'Comunidades', value: s.communities, icon: Globe, link: '/admin/communities', color: '#7c3aed' },
      { label: 'Transações', value: s.transactions, icon: TrendingUp, link: '/admin/transactions', color: 'var(--color-success)' },
      { label: 'Concluídas', value: s.completedTransactions, icon: Shield, link: '/admin/transactions', color: 'var(--color-danger)' },
    ];
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Painel Administrativo</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <For each={statCards()}>
              {(stat) => (
                <Card hover class="p-4 cursor-pointer" onClick={() => navigate(stat.link)}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                  <p class="text-2xl font-bold mt-2" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                </Card>
              )}
            </For>
          </div>

          <Show when={stats()}>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card class="p-5 col-span-1 sm:col-span-1" style={{ background: 'var(--color-primary-light)' }}>
                <div class="flex items-center gap-2 mb-2">
                  <Coins size={18} style={{ color: 'var(--color-primary)' }} />
                  <span class="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>Faturamento em Taxas</span>
                </div>
                <p class="text-3xl font-bold eq-display" style={{ color: 'var(--color-primary)' }}>{stats()!.totalFeesCollected.toFixed(2)}</p>
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>EQL arrecadados ({stats()!.completedTransactions} transações)</p>
              </Card>
              <Card class="p-5">
                <div class="flex items-center gap-2 mb-2">
                  <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                  <span class="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>Volume Total</span>
                </div>
                <p class="text-3xl font-bold eq-display" style={{ color: 'var(--color-accent)' }}>{stats()!.totalVolume.toFixed(2)}</p>
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>EQL circulados na plataforma</p>
              </Card>
              <Card class="p-5">
                <div class="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
                  <span class="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-success)' }}>Taxa Média</span>
                </div>
                <p class="text-3xl font-bold eq-display" style={{ color: 'var(--color-success)' }}>
                  {stats()!.totalVolume > 0 ? ((stats()!.totalFeesCollected / stats()!.totalVolume) * 100).toFixed(2) : '0.00'}%
                </p>
                <p class="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Sobre o volume transacionado</p>
              </Card>
            </div>
          </Show>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card hover class="p-5 cursor-pointer" onClick={() => navigate('/admin/users')}>
              <Users size={24} class="eq-brand mb-2" />
              <h3 class="font-semibold" style={{ color: 'var(--color-text)' }}>Gerenciar Usuários</h3>
              <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Promover, banir e visualizar usuários</p>
            </Card>
            <Card hover class="p-5 cursor-pointer" onClick={() => navigate('/admin/products')}>
              <Package size={24} class="eq-brand mb-2" />
              <h3 class="font-semibold" style={{ color: 'var(--color-text)' }}>Moderar Produtos</h3>
              <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Remover produtos inadequados</p>
            </Card>
            <Card hover class="p-5 cursor-pointer" onClick={() => navigate('/admin/moderation')}>
              <ShieldAlert size={24} class="eq-brand mb-2" />
              <h3 class="font-semibold" style={{ color: 'var(--color-text)' }}>Moderação de Conteúdo</h3>
              <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Ocultar ou excluir posts e comentários</p>
            </Card>
          </div>

          <Show when={recentTransactions().length > 0}>
            <div class="mb-8">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Atividade Recente</h3>
                <button onClick={() => navigate('/admin/transactions')} class="text-xs eq-link flex items-center gap-1">
                  Ver todas <ChevronRight size={12} />
                </button>
              </div>
              <div class="space-y-2">
                <For each={recentTransactions()}>
                  {(t) => (
                    <Card class="p-3 flex items-center gap-3">
                      <div class="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                        <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{t.itemTitle}</span>
                          <span class={`eq-badge ${statusColor[t.status] || 'eq-badge-info'}`}>
                            {statusLabel[t.status] || t.status}
                          </span>
                        </div>
                        <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Comprador: {t.buyerName || '—'} · Vendedor: {t.sellerName || '—'} · {t.totalPrice} EQL
                        </p>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
