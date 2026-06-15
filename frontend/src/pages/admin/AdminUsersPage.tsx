import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Shield, Ban, UserCheck } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService } from '../../services/admin.service';
import type { User } from '../../types';

const AdminUsersPage: Component = () => {
  const navigate = useNavigate();
  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [actionLoading, setActionLoading] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      const res = await adminService.getAllUsers(1, 100);
      setUsers(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const promote = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.updateUserRole(id, 'Admin');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const ban = async (id: string) => {
    setActionLoading(id);
    try {
      await adminService.banUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'user', isBanned: true } : u));
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Usuários ({users().length})</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="space-y-2">
          <For each={users()}>
            {(user) => (
              <Card class="p-3 flex items-center gap-3">
                <button onClick={() => navigate(`/users/${user.id}`)} class="shrink-0">
                  <div class="eq-avatar w-10 h-10 overflow-hidden">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} class="w-full h-full object-cover" /> : <span class="font-bold">{user.fullName[0]?.toUpperCase()}</span>}
                  </div>
                </button>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{user.fullName}</span>
                    <Show when={user.role === 'admin'}>
                      <span class="eq-badge eq-badge-primary"><Shield size={9} /> Admin</span>
                    </Show>
                    <Show when={user.isBanned}>
                      <span class="eq-badge eq-badge-warning">Banido</span>
                    </Show>
                  </div>
                  <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Desde {formatDate(user.createdAt)}</p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Show when={user.role !== 'admin'}>
                    <Button variant="outline" size="sm" onClick={() => promote(user.id)} disabled={actionLoading() === user.id}>
                      <UserCheck size={12} class="mr-1" /> Admin
                    </Button>
                  </Show>
                  <Show when={user.role !== 'admin' && !user.isBanned}>
                    <Button variant="ghost" size="sm" onClick={() => ban(user.id)} disabled={actionLoading() === user.id} style={{ color: '#dc2626' }}>
                      <Ban size={12} />
                    </Button>
                  </Show>
                </div>
              </Card>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
