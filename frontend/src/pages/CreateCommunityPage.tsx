import { type Component, createEffect, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Globe, Lock } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import type { CreateCommunityDto } from '../types';

const CreateCommunityPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [type, setType] = createSignal<'open' | 'private'>('open');
  const [productVisibility, setProductVisibility] = createSignal<'public' | 'members'>('public');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const creatorId = auth.currentUser()?.id;
    if (!creatorId) {
      setError('Você precisa estar logado para criar uma comunidade.');
      return;
    }

    if (!name().trim() || !description().trim()) {
      setError('Nome e descrição são obrigatórios.');
      return;
    }

    const payload: CreateCommunityDto = {
      name: name().trim(),
      description: description().trim(),
      imageUrl: imageUrl().trim() || undefined,
      type: type(),
      productVisibility: productVisibility(),
    };

    setLoading(true);
    try {
      await communitiesService.create(payload, creatorId);
      navigate('/communities');
    } catch (err: any) {
      setError(err.message || 'Não foi possível criar a comunidade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Button variant="ghost" class="mb-4" onClick={() => navigate('/communities')}>
        <ArrowLeft size={16} class="mr-2" />
        Voltar para comunidades
      </Button>

      <Card class="p-6 sm:p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Criar comunidade</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Reúna pessoas com interesses em comum e defina como ela vai funcionar.
          </p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              {error()}
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
              placeholder="Descreva o propósito da comunidade"
              rows={4}
              required
              class="eq-input resize-none"
            />
          </div>

          <Input
            label="URL da imagem (opcional)"
            value={imageUrl()}
            onInput={(e) => setImageUrl(e.currentTarget.value)}
            placeholder="https://..."
          />

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
            <Button type="submit" class="flex-1" disabled={loading()}>
              {loading() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Criar comunidade'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/communities')}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCommunityPage;
