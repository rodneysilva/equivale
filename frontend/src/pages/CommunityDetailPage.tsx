import { type Component, createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, Lock, Globe, Eye, EyeOff, Shield, Package, UserPlus, UserMinus, Copy } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductGrid from '../components/marketplace/ProductGrid';
import { communitiesService } from '../services/communities.service';
import { productsService } from '../services/products.service';
import { useAuth } from '../store/auth';
import type { Community, Product } from '../types';

const CommunityDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();

  const [community, setCommunity] = createSignal<Community | null>(null);
  const [products, setProducts] = createSignal<Product[]>([]);
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
      // Load products if visibility allows
      if (data.productVisibility === 'public') {
        try {
          const res = await productsService.getAll(1, 8);
          setProducts(res.data.filter(p => p.communityId === data.id));
        } catch { /* ignore */ }
      }
    } catch {
      setError('Comunidade não encontrada');
    } finally {
      setLoading(false);
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
          {/* Cover */}
          <div class="relative h-36 sm:h-48 rounded overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
            {community()!.coverUrl && (
              <img src={community()!.coverUrl} alt="" class="w-full h-full object-cover" />
            )}
          </div>

          {/* Info */}
          <div class="flex flex-col sm:flex-row items-start gap-4 -mt-12 relative z-10 px-2 sm:px-0">
            <div class="w-16 h-16 rounded eq-card flex items-center justify-center overflow-hidden shrink-0" style={{ border: '2px solid var(--color-surface)' }}>
              {community()!.imageUrl ? (
                <img src={community()!.imageUrl} alt={community()!.name} class="w-full h-full object-cover" />
              ) : (
                <span class="text-xl font-bold eq-brand">{community()!.name[0]}</span>
              )}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{community()!.name}</h1>
                <span class={`eq-badge ${community()!.type === 'private' ? 'eq-badge-warning' : 'eq-badge-primary'}`}>
                  {community()!.type === 'private' ? (
                    <><Lock size={10} class="mr-1" /> Privada</>
                  ) : (
                    <><Globe size={10} class="mr-1" /> Aberta</>
                  )}
                </span>
                <span class="eq-badge eq-badge-info">
                  {community()!.productVisibility === 'public' ? (
                    <><Eye size={10} class="mr-1" /> Produtos públicos</>
                  ) : (
                    <><EyeOff size={10} class="mr-1" /> Produtos visíveis p/ membros</>
                  )}
                </span>
              </div>
              <p class="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{community()!.description}</p>
              <div class="flex items-center gap-4 mt-2">
                <span class="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <Users size={12} /> {community()!.membersCount} membros
                </span>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              {community()!.type === 'private' && !isMember() && (
                <input
                  type="text"
                  value={inviteCodeInput()}
                  onInput={(e) => setInviteCodeInput(e.currentTarget.value)}
                  placeholder="Codigo de convite"
                  class="eq-input text-xs w-32"
                />
              )}
              {isMember() ? (
                <Button variant="outline" size="sm" onClick={handleLeave} disabled={actionLoading()}>
                  <UserMinus size={14} class="mr-1" />
                  Sair
                </Button>
              ) : (
                <Button size="sm" onClick={handleJoin} disabled={actionLoading()}>
                  <UserPlus size={14} class="mr-1" />
                  Participar
                </Button>
              )}
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
