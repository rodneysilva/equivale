import { type Component, createSignal, createEffect } from 'solid-js';
import { Plus } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import Modal from '../components/ui/Modal';
import LiquidInput from '../components/ui/LiquidInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommunityCard from '../components/community/CommunityCard';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import type { Community } from '../types';

const CommunitiesPage: Component = () => {
  const auth = useAuth();

  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showCreate, setShowCreate] = createSignal(false);
  const [creating, setCreating] = createSignal(false);

  // Create form
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [createError, setCreateError] = createSignal('');

  createEffect(() => {
    loadCommunities();
  });

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const res = await communitiesService.getAll(1, 12);
      setCommunities(res.data);
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const community = await communitiesService.create({
        name: name(),
        description: description(),
        imageUrl: imageUrl() || undefined,
      });
      setCommunities(prev => [community, ...prev]);
      setShowCreate(false);
      setName('');
      setDescription('');
      setImageUrl('');
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao criar comunidade');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Comunidades</h1>
          <p class="text-gray-500 dark:text-gray-400">Conecte-se com pessoas que compartilham seus interesses</p>
        </div>
        {auth.isAuthenticated() && (
          <LiquidButton onClick={() => setShowCreate(true)}>
            <Plus size={18} class="mr-2" />
            Criar Comunidade
          </LiquidButton>
        )}
      </div>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : communities().length === 0 ? (
        <GlassCard class="p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">Nenhuma comunidade encontrada</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Seja o primeiro a criar uma!</p>
        </GlassCard>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {communities().map(c => <CommunityCard community={c} />)}
        </div>
      )}

      {/* Create community modal */}
      <Modal
        open={showCreate()}
        onClose={() => setShowCreate(false)}
        title="Criar Comunidade"
      >
        <form onSubmit={handleCreate} class="space-y-4">
          {createError() && (
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {createError()}
            </div>
          )}
          <LiquidInput
            label="Nome"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Nome da comunidade"
            required
          />
          <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              placeholder="Descreva a comunidade"
              required
              rows={3}
              class="liquid-input w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
            />
          </div>
          <LiquidInput
            label="URL da Imagem (opcional)"
            value={imageUrl()}
            onInput={(e) => setImageUrl(e.currentTarget.value)}
            placeholder="https://..."
          />
          <div class="flex gap-3 pt-2">
            <LiquidButton type="submit" class="flex-1" disabled={creating()}>
              {creating() ? (
                <LoadingSpinner size="w-5 h-5" class="!justify-start" />
              ) : (
                'Criar Comunidade'
              )}
            </LiquidButton>
            <LiquidButton variant="ghost" onClick={() => setShowCreate(false)}>
              Cancelar
            </LiquidButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommunitiesPage;
