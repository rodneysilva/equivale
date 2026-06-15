import { type Component, createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Users, Package, Zap, Globe, TrendingUp, Shield } from 'lucide-solid';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService, type AdminStats } from '../../services/admin.service';
import { useAuth } from '../../store/auth';

const AdminDashboardPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [stats, setStats] = createSignal<AdminStats | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    try {
      setStats(await adminService.getStats());
    } catch (err) {
      console.error('Erro ao carregar stats:', err);
      navigate('/');
    }
    finally { setLoading(false); }
  });

  const statCards = () => {
    const s = stats();
    if (!s) return [];
    return [
      { label: 'Usuários', value: s.users, icon: Users, link: '/admin/users', color: 'var(--color-primary)' },
      { label: 'Produtos', value: s.products, icon: Package, link: '/admin/products', color: 'var(--color-accent)' },
      { label: 'Serviços', value: s.services, icon: Zap, link: '/admin/products', color: '#0891b2' },
      { label: 'Comunidades', value: s.communities, icon: Globe, link: '/admin/communities', color: '#7c3aed' },
      { label: 'Transações', value: s.transactions, icon: TrendingUp, link: '/transactions', color: '#059669' },
      { label: 'Concluídas', value: s.completedTransactions, icon: Shield, link: '/transactions', color: '#dc2626' },
    ];
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Painel Administrativo</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
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
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
