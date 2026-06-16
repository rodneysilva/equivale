import { type Component, createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Trash2, Globe, Lock } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService } from '../../services/admin.service';
import { api } from '../../services/api';
import { mapCommunity, type BackendCommunityDto, type BackendPagedResult } from '../../services/mappers';
import type { Community } from '../../types';

const AdminCommunitiesPage: Component = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const raw = await api.get<BackendPagedResult<BackendCommunityDto>>('/communities?page=1&pageSize=100');
      setCommunities(raw.items.map(mapCommunity));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const remove = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta comunidade?')) return;
    try {
      await adminService.deleteCommunity(id);
      setCommunities(prev => prev.filter(c => c.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Comunidades ({communities().length})</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="space-y-2">
          <For each={communities()}>
            {(community) => (
              <Card class="p-3 flex items-center gap-3">
                <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  {community.imageUrl ? (
                    <img src={community.imageUrl} alt={community.name} class="w-full h-full object-cover" />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center">
                      {community.type === 'open' ? <Globe size={18} style={{ color: 'var(--color-text-muted)' }} /> : <Lock size={18} style={{ color: 'var(--color-text-muted)' }} />}
                    </div>
                  )}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{community.name}</p>
                    <span class={`eq-badge ${community.type === 'open' ? 'eq-badge-success' : 'eq-badge-warning'}`}>
                      {community.type === 'open' ? 'Aberta' : 'Privada'}
                    </span>
                  </div>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {community.membersCount} membro{community.membersCount !== 1 ? 's' : ''} · Criador: {community.ownerName || '—'}
                  </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => remove(community.id)} style={{ color: '#dc2626' }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default AdminCommunitiesPage;
