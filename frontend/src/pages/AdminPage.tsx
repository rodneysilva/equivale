import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Shield, Users, Package, Zap, Wallet, Settings, ChevronRight } from 'lucide-solid';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../store/auth';

const adminStats = [
  { label: 'Usuários', value: '2.4k', icon: Users },
  { label: 'Comunidades', value: '350', icon: Shield },
  { label: 'Produtos', value: '2.5k', icon: Package },
  { label: 'Serviços', value: '890', icon: Zap },
  { label: 'EQL em circulação', value: '450k', icon: Wallet },
];

const AdminPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  createEffect(() => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    if (auth.currentUser()?.role !== 'admin') { navigate('/'); return; }
  });

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center gap-2 mb-6">
        <Shield size={20} class="eq-brand" />
        <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Admin</h1>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {adminStats.map(stat => (
          <Card class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span class="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
            </div>
            <p class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Sections */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card class="p-5">
          <h3 class="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Gestão</h3>
          <ul class="space-y-1">
            {[
              { label: 'Gerenciar usuários', path: '/admin/users' },
              { label: 'Gerenciar comunidades', path: '/admin/communities' },
              { label: 'Moderar produtos', path: '/admin/products' },
              { label: 'Moderar serviços', path: '/admin/services' },
              { label: 'Configurações', path: '/admin/settings' },
            ].map(item => (
              <li>
                <button
                  onClick={() => navigate(item.path)}
                  class="w-full flex items-center justify-between p-3 rounded text-sm eq-btn-ghost"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span class="flex items-center gap-2">
                    <Settings size={14} /> {item.label}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card class="p-5">
          <h3 class="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Atividade recente</h3>
          <div class="space-y-2">
            {[
              { text: 'Novo usuário registrado', time: '2 min atrás' },
              { text: 'Comunidade "Artesãos SP" criada', time: '15 min atrás' },
              { text: 'Produto publicado em "Veganos BR"', time: '1h atrás' },
              { text: '3 convites enviados para "Devs Curitiba"', time: '2h atrás' },
              { text: 'Transação de 150 EQL realizada', time: '3h atrás' },
            ].map(item => (
              <div class="flex items-center justify-between p-2.5 rounded" style={{ background: 'var(--color-surface-alt)' }}>
                <span class="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{item.text}</span>
                <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
