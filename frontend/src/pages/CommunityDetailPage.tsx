import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, Lock, Globe, Eye, EyeOff, Shield, Package, UserPlus, UserMinus, Copy } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductGrid from '../components/marketplace/ProductGrid';
import { communitiesService, type CommunityMember } from '../services/communities.service';
import { productsService } from '../services/products.service';
import { useAuth } from '../store/auth';
import type { Community, Product } from '../types';

const CommunityDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [community, setCommunity] = createSignal<Community | null>(null);
  const [products, setProducts] = createSignal<Product[]>([]);
  const [members, setMembers] = createSignal<CommunityMember[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [isMember, setIsMember] = createSignal(false);
  const [actionLoading, setActionLoading] = createSignal(false);
  const [copiedCode, setCopiedCode] = createSignal(false);
  const [inviteCodeInput, setInviteCodeInput] = createSignal('');

  createEffect(() => {
    loadCommunity();
  });

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const data = await communitiesService.getById(params.id);
      setCommunity(data);

      // Check if current user is already a member
      const userId = auth.currentUser()?.id;
      if (userId) {
        const isOwner = data.ownerId === userId;
        const isMod = data.moderators?.includes(userId);
        let isRegularMember = false;

        if (!isOwner && !isMod) {
          try {
            const userCommunities = await communitiesService.getByMember(userId);
            isRegularMember = userCommunities.some(c => c.id === data.id);
          } catch { /* ignore */ }
        }

        const member = isOwner || isMod || isRegularMember;
        setIsMember(member);

        // Load members if user is a member
        if (member) {
          try {
            setMembers(await communitiesService.getMembers(data.id));
          } catch { /* ignore */ }
        }
      }

      // Load products if visibility allows
      if (data.productVisibility === 'public' || isMember()) {
        try {
          const res = await productsService.getAll(1, 50);
          setProducts(res.data.filter(p => p.communityId === data.id));
        } catch { /* ignore */ }
      }
    } catch {
      setError('Comunidade não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const reloadMembers = async () => {
    if (community()) {
      try { setMembers(await communitiesService.getMembers(community()!.id)); } catch { /* ignore */ }
    }
  };

  const handleJoin = async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      const isPrivate = community()?.type === 'private';
      const code = isPrivate ? inviteCodeInput() : undefined;
      await communitiesService.join(params.id, code);
      setIsMember(true);
      setCommunity(prev => prev ? { ...prev, membersCount: prev.membersCount + 1 } : null);
      // Load members and products now that user is a member
      await reloadMembers();
      if (community()?.productVisibility === 'members') {
        const res = await productsService.getAll(1, 50);
        setProducts(res.data.filter(p => p.communityId === community()!.id));
      }
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
      setCommunity(prev => prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : null);
      // Clear private products
      if (community()?.productVisibility === 'members') {
        setProducts([]);
      }
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

  const isOwner = () => auth.isAuthenticated() && community()?.ownerId === auth.currentUser()?.id;
  const isModerator = () => isOwner() || (auth.isAuthenticated() && community()?.moderators.includes(auth.currentUser()!.id));

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        class="flex items-center gap-1.5 text-sm eq-link mb-6"
      >
        <ArrowLeft size={14} />
        Voltar
      </button>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : error() ? (
        <Card class="p-8 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>{error()}</p>
        </Card>
      ) : community() ? (
        <div class="space-y-6">
          {/* Cover banner with gradient overlay + name overlay */}
          <div class="relative h-44 sm:h-56 rounded-lg overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
            {community()!.coverUrl && (
              <img src={community()!.coverUrl} alt="" class="w-full h-full object-cover" loading="lazy" />
            )}
            <div class="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
            <div class="absolute bottom-4 left-4 right-4 flex items-end gap-3">
              <div class="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ border: '3px solid var(--color-surface)' }}>
                {community()!.imageUrl ? (
                  <img src={community()!.imageUrl} alt={community()!.name} class="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span class="text-2xl font-bold text-white" style={{ background: 'var(--color-primary)', width: '100%', height: '100%', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>{community()!.name[0]}</span>
                )}
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h1 class="text-xl font-bold text-white drop-shadow-lg truncate">{community()!.name}</h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class={`eq-badge ${community()!.type === 'private' ? 'eq-badge-warning' : 'eq-badge-primary'}`}>
                    {community()!.type === 'private' ? (<><Lock size={10} class="mr-1" /> Privada</>) : (<><Globe size={10} class="mr-1" /> Aberta</>)}
                  </span>
                  <span class="eq-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    <Users size={10} class="mr-1" /> {community()!.membersCount}
                  </span>
                </div>
              </div>
              <div class="shrink-0 pb-1 hidden sm:block">
                {community()!.type === 'private' && !isMember() && (
                  <input type="text" value={inviteCodeInput()} onInput={(e) => setInviteCodeInput(e.currentTarget.value)} placeholder="Código" class="eq-input text-xs w-32" />
                )}
                {isMember() ? (
                  <Button variant="outline" size="sm" onClick={handleLeave} disabled={actionLoading()}>
                    <UserMinus size={14} class="mr-1" /> Sair
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleJoin} disabled={actionLoading()}>
                    <UserPlus size={14} class="mr-1" /> Participar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile join button */}
          <div class="sm:hidden flex items-center gap-2">
            {community()!.type === 'private' && !isMember() && (
              <input type="text" value={inviteCodeInput()} onInput={(e) => setInviteCodeInput(e.currentTarget.value)} placeholder="Código de convite" class="eq-input text-xs flex-1" />
            )}
            {isMember() ? (
              <Button variant="outline" size="sm" onClick={handleLeave} disabled={actionLoading()} class="flex-1">
                <UserMinus size={14} class="mr-1" /> Sair da comunidade
              </Button>
            ) : (
              <Button size="sm" onClick={handleJoin} disabled={actionLoading()} class="flex-1">
                <UserPlus size={14} class="mr-1" /> Participar
              </Button>
            )}
          </div>

          {/* Description */}
          <div>
            <p class="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{community()!.description}</p>
            <div class="flex items-center gap-3 mt-3">
              <span class="eq-badge eq-badge-info">
                {community()!.productVisibility === 'public' ? (<><Eye size={10} class="mr-1" /> Produtos públicos</>) : (<><EyeOff size={10} class="mr-1" /> Membros apenas</>)}
              </span>
            </div>
          </div>

          {/* Moderadores */}
          {community()!.moderatorNames && community()!.moderatorNames!.length > 0 && (
            <Card class="p-4">
              <h3 class="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Shield size={12} /> Moderadores
              </h3>
              <div class="flex flex-wrap gap-2">
                {community()!.moderatorNames!.map((name: string) => (
                  <span class="eq-badge eq-badge-primary">{name}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Invite code (private communities) */}
          {community()!.type === 'private' && community()!.inviteCode && (isOwner() || isModerator()) && (
            <Card class="p-4">
              <h3 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Código de convite
              </h3>
              <div class="flex items-center gap-2">
                <code class="px-3 py-1.5 rounded text-sm font-mono" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
                  {community()!.inviteCode}
                </code>
                <button onClick={handleCopyCode} class="eq-btn eq-btn-sm eq-btn-ghost">
                  <Copy size={14} />
                </button>
                {copiedCode() && (
                  <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Copiado!</span>
                )}
              </div>
            </Card>
          )}

          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
              {error()}
            </div>
          )}

          {/* Membros (so visivel para membros) */}
          <Show when={isMember() && members().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-base font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <Users size={16} class="eq-brand" /> Membros ({members().length})
              </h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                <For each={members()}>
                  {(member) => (
                    <Card hover class="p-2.5 cursor-pointer text-center" onClick={() => navigate(`/users/${member.id}`)}>
                      <div class="eq-avatar w-10 h-10 mx-auto mb-1.5 overflow-hidden">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} class="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span class="text-sm font-bold">{member.name[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{member.name}</p>
                      <div class="flex items-center justify-center gap-1 mt-0.5">
                        {member.isOwner && <span class="eq-badge eq-badge-primary" style={{ 'font-size': '0.625rem' }}>Criador</span>}
                        {member.isModerator && !member.isOwner && <span class="eq-badge eq-badge-info" style={{ 'font-size': '0.625rem' }}>Mod</span>}
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </section>
          </Show>

          {/* Produtos da comunidade */}
          <div>
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Package size={16} /> Produtos
            </h2>
            {community()!.productVisibility === 'members' && !isMember() ? (
              <Card class="p-8 text-center">
                <EyeOff size={24} class="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Os produtos desta comunidade são visíveis apenas para membros.
                </p>
              </Card>
            ) : products().length === 0 ? (
              <Card class="p-8 text-center">
                <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum produto publicado nesta comunidade ainda.
                </p>
              </Card>
            ) : (
              <ProductGrid products={products()} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CommunityDetailPage;
