import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Plus, Globe, Lock } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommunityCard from '../components/community/CommunityCard';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import type { Community } from '../types';

const CommunitiesPage: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showCreate, setShowCreate] = createSignal(false);
  const [creating, setCreating] = createSignal(false);

  // Create form
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [type, setType] = createSignal<'open' | 'private'>('open');
  const [productVisibility, setProductVisibility] = createSignal<'public' | 'members'>('public');
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
      const userId = auth.currentUser()?.id;
      if (!userId) { setCreateError('Voce precisa estar logado'); return; }
      const community = await communitiesService.create({
        name: name(),
        description: description(),
        imageUrl: imageUrl() || undefined,
        type: type(),
        productVisibility: productVisibility(),
      }, userId);
      setCommunities(prev => [community, ...prev]);
      setShowCreate(false);
      setName('');
      setDescription('');
      setImageUrl('');
      setType('open');
      setProductVisibility('public');
    } catch (err: any) {
      setCreateError(err.message || 'Erro ao criar comunidade');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Comunidades</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Encontre seu grupo ou crie o seu</p>
        </div>
        {auth.isAuthenticated() && (
          <Button onClick={() => navigate('/communities/new')}>
            <Plus size={16} class="mr-1.5" />
            Criar comunidade
          </Button>
        )}
      </div>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : communities().length === 0 ? (
        <Card class="p-12 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma comunidade encontrada</p>
          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Seja o primeiro a criar uma!</p>
        </Card>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {communities().map(c => <CommunityCard community={c} />)}
        </div>
      )}

      {/* Create community modal */}
      <Modal
        open={showCreate()}
        onClose={() => setShowCreate(false)}
        title="Criar comunidade"
        size="lg"
      >
        <form onSubmit={handleCreate} class="space-y-4">
          {createError() && (
            <div class="p-3 rounded text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              {createError()}
            </div>
          )}
          <Input
            label="Nome"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Nome da comunidade"
            required
          />
          <div class="w-full">
            <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Descrição</label>
            <textarea
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              placeholder="Descreva a comunidade"
              required
              rows={3}
              class="eq-input resize-none"
            />
          </div>
          <Input
            label="URL da imagem (opcional)"
            value={imageUrl()}
            onInput={(e) => setImageUrl(e.currentTarget.value)}
            placeholder="https://..."
          />

          {/* Tipo */}
          <div>
            <label class="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Tipo de acesso</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('open')}
                class={`eq-card p-3 flex items-center gap-2 text-sm cursor-pointer ${type() === 'open' ? 'eq-card-hover' : ''}`}
                style={{ 'border-color': type() === 'open' ? 'var(--color-primary)' : undefined }}
              >
                <Globe size={16} class="eq-brand" />
                <div class="text-left">
                  <p class="font-medium" style={{ color: 'var(--color-text)' }}>Aberta</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Qualquer pessoa pode entrar</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('private')}
                class={`eq-card p-3 flex items-center gap-2 text-sm cursor-pointer ${type() === 'private' ? 'eq-card-hover' : ''}`}
                style={{ 'border-color': type() === 'private' ? 'var(--color-primary)' : undefined }}
              >
                <Lock size={16} class="eq-brand" />
                <div class="text-left">
                  <p class="font-medium" style={{ color: 'var(--color-text)' }}>Privada</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Apenas por convite</p>
                </div>
              </button>
            </div>
          </div>

          {/* Visibilidade dos produtos */}
          <div>
            <label class="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Visibilidade dos produtos</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProductVisibility('public')}
                class={`eq-card p-3 text-sm cursor-pointer text-left ${productVisibility() === 'public' ? 'eq-card-hover' : ''}`}
                style={{ 'border-color': productVisibility() === 'public' ? 'var(--color-primary)' : undefined }}
              >
                <p class="font-medium" style={{ color: 'var(--color-text)' }}>Público</p>
                <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos visíveis para todos</p>
              </button>
              <button
                type="button"
                onClick={() => setProductVisibility('members')}
                class={`eq-card p-3 text-sm cursor-pointer text-left ${productVisibility() === 'members' ? 'eq-card-hover' : ''}`}
                style={{ 'border-color': productVisibility() === 'members' ? 'var(--color-primary)' : undefined }}
              >
                <p class="font-medium" style={{ color: 'var(--color-text)' }}>Membros</p>
                <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Apenas membros veem os produtos</p>
              </button>
            </div>
          </div>

          <div class="flex gap-2 pt-2">
            <Button type="submit" class="flex-1" disabled={creating()}>
              {creating() ? (
                <LoadingSpinner size="w-4 h-4" class="!justify-start" />
              ) : (
                'Criar comunidade'
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommunitiesPage;
