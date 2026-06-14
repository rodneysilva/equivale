import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Shield, LogIn, Package, Zap, Users, TrendingUp } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AdminSidebar from '../components/admin/AdminSidebar';
import ModerationQueue from '../components/admin/ModerationQueue';
import UserManagement from '../components/admin/UserManagement';
import { useAuth } from '../store/auth';
import { api } from '../services/api';
import type { ModerationItem, User } from '../types';

const AdminPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [activeTab, setActiveTab] = createSignal('dashboard');
  const [loading, setLoading] = createSignal(true);
  const [moderationItems, setModerationItems] = createSignal<ModerationItem[]>([]);
  const [users, setUsers] = createSignal<User[]>([]);
  const [userSearch, setUserSearch] = createSignal('');
  const [stats, setStats] = createSignal({ totalUsers: 0, totalProducts: 0, totalServices: 0, totalTransactions: 0 });

  createEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (auth.currentUser()?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [modRes, usersRes, statsRes] = await Promise.allSettled([
        api.get<ModerationItem[]>('/admin/moderation'),
        api.get<User[]>('/admin/users'),
        api.get<{ totalUsers: number; totalProducts: number; totalServices: number; totalTransactions: number }>('/admin/stats'),
      ]);
      if (modRes.status === 'fulfilled') setModerationItems(modRes.value);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: string) => {
    try {
      await api.post(`/admin/moderation/${id}/approve`, { type });
      setModerationItems(prev => prev.filter(item => item.id !== id));
    } catch {
      // handle error
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      await api.post(`/admin/moderation/${id}/reject`, { type });
      setModerationItems(prev => prev.filter(item => item.id !== id));
    } catch {
      // handle error
    }
  };

  const handleBan = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    } catch {
      // handle error
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u));
    } catch {
      // handle error
    }
  };

  if (!auth.isAuthenticated() || auth.currentUser()?.role !== 'admin') {
    return (
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Shield size={40} class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 mb-4">Acesso restrito a administradores</p>
        <LiquidButton onClick={() => navigate('/')}>Voltar ao início</LiquidButton>
      </div>
    );
  }

  const statCards = [
    { label: 'Usuários', value: stats().totalUsers, icon: Users, color: 'text-indigo-500' },
    { label: 'Produtos', value: stats().totalProducts, icon: Package, color: 'text-green-500' },
    { label: 'Serviços', value: stats().totalServices, icon: Zap, color: 'text-cyan-500' },
    { label: 'Transações', value: stats().totalTransactions, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Administração</h1>
        <p class="text-gray-500 dark:text-gray-400">Gerencie a plataforma</p>
      </div>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : (
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-64 shrink-0">
            <div class="lg:sticky lg:top-24">
              <AdminSidebar activeTab={activeTab()} onTabChange={setActiveTab} />
            </div>
          </div>

          <div class="flex-1">
            {activeTab() === 'dashboard' && (
              <div class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {statCards.map(s => (
                    <GlassCard class="p-4">
                      <div class="flex items-center gap-3">
                        <s.icon size={24} class={s.color} />
                        <div>
                          <p class="text-2xl font-bold text-gray-900 dark:text-white">{s.value || '...'}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab() === 'moderation' && (
              <ModerationQueue
                items={moderationItems()}
                isLoading={loading()}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}

            {activeTab() === 'users' && (
              <UserManagement
                users={users()}
                isLoading={loading()}
                onBan={handleBan}
                onUnban={handleUnban}
                search={userSearch()}
                onSearch={setUserSearch}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
