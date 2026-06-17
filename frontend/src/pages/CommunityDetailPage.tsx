import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, Lock, Globe, Shield, Package, Zap, UserPlus, UserMinus, Copy, ArrowRight, EyeOff, Pencil, MessageCircle } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommentSection from '../components/community/CommentSection';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import { api } from '../services/api';
import { communitiesService, type CommunityMember } from '../services/communities.service';
import { postsService } from '../services/posts.service';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { useAuth } from '../store/auth';
import type { Community, Product, Service } from '../types';

const CommunityDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [community, setCommunity] = createSignal<Community | null>(null);
  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [members, setMembers] = createSignal<CommunityMember[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [isMember, setIsMember] = createSignal(false);
  const [actionLoading, setActionLoading] = createSignal(false);
  const [copiedCode, setCopiedCode] = createSignal(false);
  const [inviteCodeInput, setInviteCodeInput] = createSignal('');
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [editName, setEditName] = createSignal('');
  const [editDescription, setEditDescription] = createSignal('');
  const [editImageUrl, setEditImageUrl] = createSignal('');
  const [editCoverUrl, setEditCoverUrl] = createSignal('');
  const [editType, setEditType] = createSignal<'open' | 'private'>('open');
  const [editVisibility, setEditVisibility] = createSignal<'public' | 'members'>('public');
  const [editSaving, setEditSaving] = createSignal(false);
  const [editError, setEditError] = createSignal('');
  const [posts, setPosts] = createSignal<any[]>([]);
  const [postContent, setPostContent] = createSignal('');
  const [postSending, setPostSending] = createSignal(false);
  const [postsLoading, setPostsLoading] = createSignal(false);
  const [generatingCode, setGeneratingCode] = createSignal(false);
  const [moderatorInput, setModeratorInput] = createSignal('');
  const [moderatorLoading, setModeratorLoading] = createSignal(false);

  createEffect(() => { loadCommunity(); });

  const loadCommunity = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await communitiesService.getById(params.id);
      setCommunity(data);

      const userId = auth.currentUser()?.id;
      if (!userId) { setLoading(false); return; }

      // Check membership via members endpoint (most reliable)
      let member = data.ownerId === userId;
      let allMembers: CommunityMember[] = [];
      try {
        allMembers = await communitiesService.getMembers(data.id);
        if (!member) member = allMembers.some(m => m.id === userId);
      } catch { /* ignore */ }

      setIsMember(member);

      if (member) {
        setMembers(allMembers);
        loadPosts();
        const [p, s] = await Promise.all([
          productsService.getAll(1, 6, undefined, undefined, undefined, undefined, data.id),
          servicesService.getAll(1, 6, undefined, undefined, undefined, undefined, data.id),
        ]);
        setProducts(p.data);
        setServices(s.data);
      }
    } catch {
      setError('Comunidade não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      const isPrivate = community()?.type === 'private';
      const code = isPrivate ? inviteCodeInput() : undefined;
      await communitiesService.join(params.id, code);
      setIsMember(true);
      setCommunity(prev => prev ? { ...prev, membersCount: prev.membersCount + 1 } : null);
      // Load content now that user is a member
      const [p, s, m] = await Promise.all([
        productsService.getAll(1, 6, undefined, undefined, undefined, undefined, community()!.id),
        servicesService.getAll(1, 6, undefined, undefined, undefined, undefined, community()!.id),
        communitiesService.getMembers(community()!.id).catch(() => []),
      ]);
      setProducts(p.data);
      setServices(s.data);
      setMembers(m);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await communitiesService.leave(params.id);
      setIsMember(false);
      setMembers([]);
      setProducts([]);
      setServices([]);
      setCommunity(prev => prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : null);
    } catch (err: any) {
      setError(err.message || 'Erro ao sair');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (community()?.inviteCode) {
      navigator.clipboard.writeText(community()!.inviteCode!);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGeneratePassword = async () => {
    setGeneratingCode(true);
    try {
      const res = await api.post<{ password: string; message: string }>(`/communities/${params.id}/generate-password`);
      setCommunity(prev => prev ? { ...prev, inviteCode: res.password } : null);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar código');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleAddModerator = async () => {
    const userId = moderatorInput().trim();
    if (!userId) return;
    setModeratorLoading(true);
    try {
      await communitiesService.addModerator(params.id, userId);
      setCommunity(prev => prev ? { ...prev, moderators: [...(prev.moderators || []), userId] } : null);
      setModeratorInput('');
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar');
    } finally {
      setModeratorLoading(false);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    setModeratorLoading(true);
    try {
      await communitiesService.removeModerator(params.id, userId);
      setCommunity(prev => prev ? { ...prev, moderators: prev.moderators.filter(m => m !== userId) } : null);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover');
    } finally {
      setModeratorLoading(false);
    }
  };

  const openEditModal = () => {
    const c = community();
    if (!c) return;
    setEditName(c.name);
    setEditDescription(c.description);
    setEditImageUrl(c.imageUrl ?? '');
    setEditCoverUrl(c.coverUrl ?? '');
    setEditType(c.type);
    setEditVisibility(c.productVisibility);
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!editName().trim() || !editDescription().trim()) {
      setEditError('Nome e descrição são obrigatórios.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const updated = await communitiesService.update(community()!.id, {
        name: editName().trim(),
        description: editDescription().trim(),
        imageUrl: editImageUrl().trim() || undefined,
        coverUrl: editCoverUrl().trim() || undefined,
        type: editType(),
        productVisibility: editVisibility(),
      });
      setCommunity(updated);
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Erro ao salvar');
    } finally {
      setEditSaving(false);
    }
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await postsService.getByCommunity(params.id);
      setPosts(res.data || []);
    } catch { /* ignore */ }
    finally { setPostsLoading(false); }
  };

  const handleCreatePost = async () => {
    const content = postContent().trim();
    if (!content) return;
    setPostSending(true);
    try {
      const post = await postsService.create(params.id, content);
      setPosts(prev => [post, ...prev]);
      setPostContent('');
    } catch { /* ignore */ }
    finally { setPostSending(false); }
  };

  const isOwner = () => auth.isAuthenticated() && community()?.ownerId === auth.currentUser()?.id;
  const isModerator = () => isOwner() || (auth.isAuthenticated() && (community()?.moderators?.includes(auth.currentUser()!.id) ?? false));

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-6">
        <ArrowLeft size={14} /> Voltar
      </button>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : error() ? (
        <Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>{error()}</p></Card>
      ) : community() ? (
        <div class="space-y-6">
          {/* Banner */}
          <div class="relative h-44 sm:h-56 rounded-lg overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
            {community()!.coverUrl && <img src={community()!.coverUrl} alt="" class="w-full h-full object-cover" loading="lazy" />}
            <div class="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
            <div class="absolute bottom-4 left-4 right-4 flex items-end gap-3">
              <div class="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ border: '3px solid var(--color-surface)' }}>
                {community()!.imageUrl ? (
                  <img src={community()!.imageUrl} alt={community()!.name} class="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span class="text-2xl font-bold text-white" style={{ background: 'var(--color-primary)', width: '100%', height: '100%', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>{community()!.name[0]}</span>
                )}
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-xl font-bold text-white drop-shadow-lg truncate" title={community()!.name}>{community()!.name}</h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class={`eq-badge ${community()!.type === 'private' ? 'eq-badge-warning' : 'eq-badge-primary'}`}>
                    {community()!.type === 'private' ? (<><Lock size={10} class="mr-1" /> Privada</>) : (<><Globe size={10} class="mr-1" /> Aberta</>)}
                  </span>
                  <span class="eq-badge" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--color-surface)' }}>
                    <Users size={10} class="mr-1" /> {community()!.membersCount}
                  </span>
                </div>
              </div>
              <Show when={isMember()}>
                <Show when={isModerator()}>
                  <Button variant="outline" size="sm" onClick={openEditModal} class="shrink-0" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                    <Pencil size={14} class="mr-1" /> Editar
                  </Button>
                </Show>
                <Button variant="outline" size="sm" onClick={handleLeave} disabled={actionLoading()} class="shrink-0" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                  <UserMinus size={14} class="mr-1" /> Sair
                </Button>
              </Show>
            </div>
          </div>

          {/* Description + Join (for non-members) */}
          <div>
            <p class="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{community()!.description}</p>
          </div>

          <Show when={!isMember()}>
            {/* Join prompt for non-members */}
            <Card class="p-6 text-center">
              <EyeOff size={28} class="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <h2 class="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Conteúdo exclusivo para membros</h2>
              <p class="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Participe da comunidade para ver produtos, serviços e membros.
              </p>
              <div class="flex items-center justify-center gap-2">
                <Show when={community()!.type === 'private'}>
                  <input type="text" value={inviteCodeInput()} onInput={(e) => setInviteCodeInput(e.currentTarget.value)} placeholder="Código de convite" class="eq-input text-sm w-40" />
                </Show>
                <Button size="md" onClick={handleJoin} disabled={actionLoading()}>
                  <UserPlus size={16} class="mr-1.5" /> Participar
                </Button>
              </div>
            </Card>
          </Show>

          {/* === MEMBER CONTENT === */}
          <Show when={isMember()}>
            {/* Invite code (for owners/mods of private communities) */}
            <Show when={community()!.type === 'private' && community()!.inviteCode && (isOwner() || isModerator())}>
              <Card class="p-4">
                <h3 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Código de convite</h3>
                <div class="flex items-center gap-2">
                  <code class="px-3 py-1.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>{community()!.inviteCode}</code>
                  <button onClick={handleCopyCode} class="eq-btn eq-btn-sm eq-btn-ghost"><Copy size={14} /></button>
                  {copiedCode() && <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Copiado!</span>}
                </div>
                <button onClick={handleGeneratePassword} disabled={generatingCode()} class="text-xs eq-link mt-1">
                  {generatingCode() ? 'Gerando...' : 'Gerar novo código'}
                </button>
              </Card>
            </Show>

            {/* Moderators (owners only) */}
            <Show when={isOwner() && community()!.moderators && community()!.moderators.length > 0}>
              <Card class="p-4">
                <h3 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Moderadores</h3>
                <div class="space-y-1.5 mb-3">
                  <For each={community()!.moderators}>
                    {(modId) => (
                      <div class="flex items-center justify-between py-1 px-2 rounded" style={{ background: 'var(--color-surface-alt)' }}>
                        <div class="flex items-center gap-2">
                          <Shield size={12} class="eq-text-muted" />
                          <span class="text-sm eq-text">{modId}</span>
                        </div>
                        <button onClick={() => handleRemoveModerator(modId)} disabled={moderatorLoading()} class="text-xs eq-text-danger eq-btn-ghost">Remover</button>
                      </div>
                    )}
                  </For>
                </div>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={moderatorInput()}
                    onInput={(e) => setModeratorInput(e.currentTarget.value)}
                    placeholder="ID do usuário"
                    class="eq-input text-sm flex-1"
                  />
                  <button onClick={handleAddModerator} disabled={moderatorLoading() || !moderatorInput().trim()} class="eq-btn eq-btn-sm">
                    Adicionar
                  </button>
                </div>
                {moderatorLoading() && <p class="text-xs eq-text-muted mt-1">Carregando...</p>}
              </Card>
            </Show>

            {/* Posts / Chat */}
            <section>
              <div class="flex items-center justify-between mb-3">
                <h2 class="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  <MessageCircle size={16} class="eq-text-community" /> Conversas
                </h2>
                <span class="text-xs eq-text-muted">{posts().length} mensagen{posts().length !== 1 ? 's' : ''}</span>
              </div>

              {/* Post input */}
              <Card class="p-4 mb-4">
                <div class="flex gap-3">
                  <div class="eq-avatar w-9 h-9 text-xs shrink-0 mt-0.5">
                    {auth.currentUser()?.fullName?.[0]?.toUpperCase() || auth.currentUser()?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div class="flex-1">
                    <textarea
                      value={postContent()}
                      onInput={(e) => setPostContent(e.currentTarget.value)}
                      placeholder="Compartilhe algo com a comunidade..."
                      rows={2}
                      class="eq-input resize-none text-sm"
                    />
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs eq-text-muted">{postContent().length}/500</span>
                      <button
                        onClick={handleCreatePost}
                        disabled={postSending() || !postContent().trim()}
                        class="eq-btn eq-btn-sm"
                      >
                        {postSending() ? 'Enviando...' : 'Publicar'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Posts list */}
              <Show when={posts().length > 0} fallback={
                <Card class="p-6 text-center">
                  <MessageCircle size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <p class="text-sm eq-text-muted">Nenhuma mensagem ainda. Seja o primeiro a compartilhar!</p>
                </Card>
              }>
                <div class="space-y-3">
                  <For each={posts().slice(0, 10)}>
                    {(post) => (
                      <Card class="p-4">
                        <div class="flex gap-3">
                          <div class="eq-avatar w-9 h-9 text-xs shrink-0 overflow-hidden" onClick={() => navigate(`/users/${post.authorId}`)} style={{ cursor: 'pointer' }}>
                            {post.authorAvatarUrl ? (
                              <img src={post.authorAvatarUrl} alt={post.authorName} class="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <span>{post.authorName?.[0]?.toUpperCase() || '?'}</span>
                            )}
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                              <button onClick={() => navigate(`/users/${post.authorId}`)} class="text-sm font-semibold eq-link">
                                {post.authorName || 'Usuário'}
                              </button>
                              <span class="text-xs eq-text-muted">{new Date(post.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p class="text-sm eq-text whitespace-pre-wrap break-words">{post.content}</p>
                            <div class="mt-3" style={{ 'border-top': '1px solid var(--color-border)', 'padding-top': '12px' }}>
                              <CommentSection communityId={params.id} postId={post.id} />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </For>
                </div>
              </Show>
            </section>

            {/* Membros */}
            <Show when={members().length > 0}>
              <section>
                <div class="flex items-center justify-between mb-3">
                  <h2 class="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--color-text)' }}>
                    <Users size={16} class="eq-brand" /> Membros ({members().length})
                  </h2>
                  <button onClick={() => navigate(`/communities/${params.id}/members`)} class="flex items-center gap-1 text-xs eq-link">
                    Ver todos <ArrowRight size={12} />
                  </button>
                </div>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <For each={members().slice(0, 6)}>
                    {(member) => (
                      <Card hover class="p-2.5 cursor-pointer text-center" onClick={() => navigate(`/users/${member.id}`)}>
                        <div class="eq-avatar w-10 h-10 mx-auto mb-1.5 overflow-hidden">
                          {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} class="w-full h-full object-cover" loading="lazy" /> : <span class="text-sm font-bold">{member.name[0]?.toUpperCase()}</span>}
                        </div>
                        <p class="text-xs font-medium truncate" title={member.name} style={{ color: 'var(--color-text)' }}>{member.name}</p>
                        <Show when={member.isOwner}><span class="eq-badge eq-badge-primary mt-0.5 inline-block" style={{ 'font-size': '0.625rem' }}>Criador</span></Show>
                        <Show when={member.isModerator && !member.isOwner}><span class="eq-badge eq-badge-info mt-0.5 inline-block" style={{ 'font-size': '0.625rem' }}>Mod</span></Show>
                      </Card>
                    )}
                  </For>
                </div>
              </section>
            </Show>

            {/* Produtos recentes */}
            <section>
              <div class="flex items-center justify-between mb-3">
                <h2 class="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  <Package size={16} class="eq-brand" /> Produtos
                </h2>
                <button onClick={() => navigate(`/communities/${params.id}/products`)} class="flex items-center gap-1 text-xs eq-link">
                  Ver todos <ArrowRight size={12} />
                </button>
              </div>
              <Show when={products().length > 0} fallback={
                <Card class="p-6 text-center"><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhum produto ainda.</p></Card>
              }>
                <ProductGrid products={products()} />
              </Show>
            </section>

            {/* Serviços recentes */}
            <section>
              <div class="flex items-center justify-between mb-3">
                <h2 class="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--color-text)' }}>
                  <Zap size={16} class="eq-brand" /> Serviços
                </h2>
                <button onClick={() => navigate(`/communities/${params.id}/services`)} class="flex items-center gap-1 text-xs eq-link">
                  Ver todos <ArrowRight size={12} />
                </button>
              </div>
              <Show when={services().length > 0} fallback={
                <Card class="p-6 text-center"><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhum serviço ainda.</p></Card>
              }>
                <ServiceGrid services={services()} />
              </Show>
            </section>
          </Show>

          {/* Edit Modal */}
          <Modal open={showEditModal()} onClose={() => setShowEditModal(false)} title="Editar comunidade" size="lg">
            <form onSubmit={handleEditSubmit} class="space-y-4">
              {editError() && (
                <div class="p-3 rounded text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{editError()}</div>
              )}
              <Input label="Nome" value={editName()} onInput={(e) => setEditName(e.currentTarget.value)} placeholder="Nome da comunidade" required />
              <div>
                <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Descrição</label>
                <textarea value={editDescription()} onInput={(e) => setEditDescription(e.currentTarget.value)} placeholder="Descreva o propósito da comunidade" rows={4} required class="eq-input resize-none" />
              </div>
              <Input label="URL da imagem" value={editImageUrl()} onInput={(e) => setEditImageUrl(e.currentTarget.value)} placeholder="https://..." />
              <Input label="URL da capa" value={editCoverUrl()} onInput={(e) => setEditCoverUrl(e.currentTarget.value)} placeholder="https://..." />
              <div>
                <label class="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Tipo de acesso</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setEditType('open')} class={`eq-card p-3 flex items-center gap-2 text-sm cursor-pointer ${editType() === 'open' ? 'eq-card-hover' : ''}`} style={{ 'border-color': editType() === 'open' ? 'var(--color-primary)' : undefined }}>
                    <Globe size={16} class="eq-brand" />
                    <div class="text-left">
                      <p class="font-medium" style={{ color: 'var(--color-text)' }}>Aberta</p>
                      <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Qualquer pessoa pode entrar</p>
                    </div>
                  </button>
                  <button type="button" onClick={() => setEditType('private')} class={`eq-card p-3 flex items-center gap-2 text-sm cursor-pointer ${editType() === 'private' ? 'eq-card-hover' : ''}`} style={{ 'border-color': editType() === 'private' ? 'var(--color-primary)' : undefined }}>
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
                  <button type="button" onClick={() => setEditVisibility('public')} class={`eq-card p-3 text-sm cursor-pointer text-left ${editVisibility() === 'public' ? 'eq-card-hover' : ''}`} style={{ 'border-color': editVisibility() === 'public' ? 'var(--color-primary)' : undefined }}>
                    <p class="font-medium" style={{ color: 'var(--color-text)' }}>Público</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos visíveis para todos</p>
                  </button>
                  <button type="button" onClick={() => setEditVisibility('members')} class={`eq-card p-3 text-sm cursor-pointer text-left ${editVisibility() === 'members' ? 'eq-card-hover' : ''}`} style={{ 'border-color': editVisibility() === 'members' ? 'var(--color-primary)' : undefined }}>
                    <p class="font-medium" style={{ color: 'var(--color-text)' }}>Membros</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Apenas membros veem os produtos</p>
                  </button>
                </div>
              </div>
              <div class="flex gap-2 pt-2">
                <Button type="submit" class="flex-1" disabled={editSaving()}>
                  {editSaving() ? 'Salvando...' : 'Salvar alterações'}
                </Button>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancelar</Button>
              </div>
            </form>
          </Modal>

          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{error()}</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CommunityDetailPage;
