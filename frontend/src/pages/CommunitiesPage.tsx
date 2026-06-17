import { type Component, createSignal, createEffect, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Plus, Globe, Lock, Users, Sparkles, ArrowRight, Search } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommunityCard from '../components/community/CommunityCard';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import type { Community } from '../types';

const PAGE_SIZE = 12;

const CommunitiesPage: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [total, setTotal] = createSignal(0);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [query, setQuery] = createSignal('');
  const [showCreate, setShowCreate] = createSignal(false);
  const [creating, setCreating] = createSignal(false);

  // Create form
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [type, setType] = createSignal<'open' | 'private'>('open');
  const [productVisibility, setProductVisibility] = createSignal<'public' | 'members'>('public');
  const [createError, setCreateError] = createSignal('');

  const loadCommunities = async (reset = true) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const p = reset ? 1 : page() + 1;
      const res = await communitiesService.getAll(p, PAGE_SIZE);
      setCommunities(reset ? res.data : (prev) => [...prev, ...res.data]);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(p);
    } catch {
      if (reset) setCommunities([]);
    } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  };

  createEffect(() => {
    loadCommunities(true);
  });

  // Filtra localmente as comunidades já carregadas pela busca.
  const filtered = () => {
    const q = query().trim().toLowerCase();
    if (!q) return communities();
    return communities().filter(
      (c) => c.name?.toLowerCase().includes(q) || (c as any).description?.toLowerCase().includes(q),
    );
  };

  const hasMore = () => page() < totalPages();

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
      setTotal(prev => prev + 1);
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
      {/* Intro / hero da seção */}
      <section class="eq-card p-6 sm:p-8 mb-8" style={{ background: 'var(--color-community-bg, var(--color-primary-light))', border: '1px solid var(--color-border)' }}>
        <div class="flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="flex-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'var(--color-surface)', color: 'var(--color-community)' }}>
              <Sparkles size={12} /> Economia solidária
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold eq-display" style={{ color: 'var(--color-text)' }}>
              Comunidades que <span style={{ color: 'var(--color-community)' }}>trocam</span> juntos
            </h1>
            <p class="text-sm sm:text-base mt-3 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              Entre em grupos que compartilham seus interesses — artesanato, tecnologia, alimentação, bem-estar.
              Publique produtos e serviços, participe de conversas e movimente a economia local com EQL.
              Não achou a sua? <strong style={{ color: 'var(--color-text)' }}>Crie uma comunidade</strong> em segundos.
            </p>
            <div class="flex flex-wrap gap-2 mt-5">
              <Show when={auth.isAuthenticated()}>
                <Button onClick={() => navigate('/communities/new')}>
                  <Plus size={16} class="mr-1.5" /> Criar comunidade
                </Button>
              </Show>
              <Show when={!auth.isAuthenticated()}>
                <Button onClick={() => navigate('/register')}>
                  Entrar na plataforma <ArrowRight size={16} class="ml-1.5" />
                </Button>
              </Show>
              <Button variant="outline" onClick={() => document.getElementById('communities-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar comunidades
              </Button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 lg:w-64 shrink-0">
            <div class="eq-card p-4 text-center">
              <div class="text-2xl font-bold" style={{ color: 'var(--color-community)' }}>{total()}</div>
              <div class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>comunidades ativas</div>
            </div>
            <div class="eq-card p-4 text-center">
              <div class="inline-flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                <Users size={20} class="mr-1" /> {auth.isAuthenticated() ? 'Você' : '—'}
              </div>
              <div class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>faça parte também</div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de ações: busca + total + criar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Todas as comunidades</h2>
          <span class="eq-badge eq-badge-info">{total()} no total</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search size={14} class="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              placeholder="Buscar comunidade..."
              class="eq-input pl-8 text-sm w-full sm:w-56"
            />
          </div>
          <Show when={auth.isAuthenticated()}>
            <Button size="sm" onClick={() => navigate('/communities/new')}>
              <Plus size={14} class="mr-1" /> Criar
            </Button>
          </Show>
        </div>
      </div>

      <div id="communities-grid">
        {loading() ? (
          <LoadingSpinner class="py-20" />
        ) : filtered().length === 0 ? (
          <Card class="p-12 text-center">
            <p style={{ color: 'var(--color-text-muted)' }}>
              {query() ? 'Nenhuma comunidade encontrada para sua busca.' : 'Nenhuma comunidade encontrada'}
            </p>
            <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Seja o primeiro a criar uma!</p>
          </Card>
        ) : (
          <>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered().map((c) => <CommunityCard community={c} />)}
            </div>
            <Show when={hasMore() && !query()}>
              <div class="flex justify-center mt-8">
                <Button variant="outline" onClick={() => loadCommunities(false)} disabled={loadingMore()}>
                  {loadingMore() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Carregar mais comunidades'}
                </Button>
              </div>
            </Show>
          </>
        )}
      </div>

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
