import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, Lock, Globe, Shield, Package, Zap, UserPlus, UserMinus, Copy, ArrowRight, EyeOff } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import { communitiesService, type CommunityMember } from '../services/communities.service';
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

  const isOwner = () => auth.isAuthenticated() && community()?.ownerId === auth.currentUser()?.id;
  const isModerator = () => isOwner() || (auth.isAuthenticated() && (community()?.moderators?.includes(auth.currentUser()!.id) ?? false));

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
                  <span class="eq-badge" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
                    <Users size={10} class="mr-1" /> {community()!.membersCount}
                  </span>
                </div>
              </div>
              <Show when={isMember()}>
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
              </Card>
            </Show>

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

          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CommunityDetailPage;
