import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import {
  ArrowLeft, Package, Zap, Users as UsersIcon, ExternalLink, Star, TrendingUp,
  Globe, ShoppingCart, MessageCircle, User as UserIcon,
} from 'lucide-solid';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import { usersService } from '../services/users.service';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { reviewsService } from '../services/transactions.service';
import { activitiesService } from '../services/activities.service';
import { useToast } from '../store/toast';
import { getSocialLinkIcon, getSocialLinkLabel } from '../data/avatars';
import type { User, Product, Service, UserCommunity, Review, UserActivity } from '../types';

const ACTIVITY_META: Record<string, { icon: any; label: string }> = {
  ProductPublished: { icon: Package, label: 'publicou um produto' },
  ServicePublished: { icon: Zap, label: 'ofereceu um serviço' },
  CommunityCreated: { icon: Globe, label: 'criou uma comunidade' },
  CommunityJoined: { icon: UsersIcon, label: 'entrou na comunidade' },
  Purchase: { icon: ShoppingCart, label: 'fez uma compra' },
  Sale: { icon: TrendingUp, label: 'fez uma venda' },
  ReviewGiven: { icon: Star, label: 'avaliou uma transação' },
  PostCreated: { icon: MessageCircle, label: 'publicou na comunidade' },
  ProfileUpdated: { icon: UserIcon, label: 'atualizou o perfil' },
};

function activityIcon(type: string) {
  return ACTIVITY_META[type]?.icon ?? Package;
}

function activityLabel(activity: UserActivity): string {
  if (activity.description) {
    return activity.entityTitle
      ? `${activity.description}: ${activity.entityTitle}`
      : activity.description;
  }
  return ACTIVITY_META[activity.type]?.label ?? activity.type;
}

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return 'agora mesmo';
  if (min < 60) return `há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  if (hour < 24) return `há ${hour} ${hour === 1 ? 'hora' : 'horas'}`;
  if (day === 1) return 'ontem';
  if (day < 7) return `há ${day} dias`;
  if (day < 30) return `há ${Math.floor(day / 7)} ${Math.floor(day / 7) === 1 ? 'semana' : 'semanas'}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function activityTarget(activity: UserActivity): string | null {
  if (!activity.entityId || !activity.entityType) return null;
  switch (activity.entityType) {
    case 'Product': return `/products/${activity.entityId}`;
    case 'Service': return `/services/${activity.entityId}`;
    case 'Community': return `/communities/${activity.entityId}`;
    case 'Post': return activity.entityId ? `/communities` : null;
    default: return null;
  }
}

const UserProfilePage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = createSignal<User | null>(null);
  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [communities, setCommunities] = createSignal<UserCommunity[]>([]);
  const [reviews, setReviews] = createSignal<Review[]>([]);
  const [activities, setActivities] = createSignal<UserActivity[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const [u, p, s, c, r, a] = await Promise.all([
        usersService.getById(params.id),
        productsService.getAll(1, 100, undefined, undefined, undefined, params.id),
        servicesService.getAll(1, 100, undefined, undefined, undefined, params.id),
        usersService.getCommunities(params.id),
        reviewsService.getByUser(params.id),
        activitiesService.getByUser(params.id, 1, 20).catch(() => null),
      ]);
      setUser(u);
      setProducts(p.data);
      setServices(s.data);
      setCommunities(c);
      setReviews(r);
      if (a) setActivities(a.data);
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível carregar este perfil.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-6">
        <ArrowLeft size={14} /> Voltar
      </button>

      {loading() ? <LoadingSpinner class="py-20" /> : user() ? (
        <div class="space-y-6">
          {/* Profile header */}
          <Card class="p-6">
            <div class="flex flex-col sm:flex-row items-start gap-5">
              <div class="eq-avatar w-24 h-24 text-3xl shrink-0 overflow-hidden">
                {user()!.avatarUrl ? (
                  <img src={user()!.avatarUrl} alt={user()!.fullName} class="w-full h-full object-cover" />
                ) : (
                  user()!.fullName?.[0]?.toUpperCase() ?? '?'
                )}
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{user()!.fullName}</h1>
                <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Membro desde {new Date(user()!.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
                {user()!.bio && (
                  <p class="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{user()!.bio}</p>
                )}

                {/* Social links */}
                <Show when={user()!.socialLinks && user()!.socialLinks!.length > 0}>
                  <div class="flex flex-wrap gap-2 mt-4">
                    <For each={user()!.socialLinks}>
                      {(link) => (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 eq-badge eq-badge-info cursor-pointer hover:opacity-80 transition-opacity"
                          title={getSocialLinkLabel(link.type)}
                        >
                          <span>{getSocialLinkIcon(link.type)}</span>
                          <span class="text-xs">{getSocialLinkLabel(link.type)}</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Stats */}
              <div class="flex sm:flex-col gap-4 shrink-0">
                <div class="text-center">
                  <p class="text-xl font-bold eq-brand">{products().length}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold eq-brand">{services().length}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Serviços</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold eq-brand">{communities().length}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Comunidades</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Communities */}
          <Show when={communities().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <UsersIcon size={18} class="eq-brand" /> Comunidades
              </h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <For each={communities()}>
                  {(c) => (
                    <Card hover class="p-3 cursor-pointer text-center" onClick={() => navigate(`/communities/${c.id}`)}>
                      <div class="eq-avatar w-12 h-12 mx-auto mb-2 overflow-hidden">
                        {c.imageUrl ? <img src={c.imageUrl} alt={c.name} class="w-full h-full object-cover" /> : c.name[0]}
                      </div>
                      <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                      <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.membersCount} membros</p>
                      <Show when={c.isOwner}>
                        <span class="eq-badge eq-badge-primary mt-1 inline-block">Criador</span>
                      </Show>
                    </Card>
                  )}
                </For>
              </div>
            </section>
          </Show>

          {/* Products */}
          <Show when={products().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <Package size={18} class="eq-brand" /> Produtos ({products().length})
              </h2>
              <ProductGrid products={products()} />
            </section>
          </Show>

          {/* Services */}
          <Show when={services().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <Zap size={18} class="eq-brand" /> Serviços ({services().length})
              </h2>
              <ServiceGrid services={services()} />
            </section>
          </Show>

          {/* Reviews */}
          <Show when={reviews().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <Star size={18} class="eq-brand" /> Avaliações ({reviews().length})
              </h2>
              <div class="space-y-2">
                <For each={reviews().slice(0, 5)}>
                  {(review) => (
                    <Card class="p-3 flex items-start gap-3">
                      <div class="eq-avatar w-9 h-9 overflow-hidden shrink-0">
                        {review.reviewerAvatarUrl ? <img src={review.reviewerAvatarUrl} alt={review.reviewerName} class="w-full h-full object-cover" /> : <span class="text-xs font-bold">{review.reviewerName?.[0]?.toUpperCase() ?? '?'}</span>}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{review.reviewerName ?? 'Anônimo'}</span>
                          <div class="flex items-center gap-0.5">
                            <For each={Array.from({ length: 5 })}>{(_, i) => (
                              <Star size={10} style={{ color: i() < review.rating ? 'var(--color-warning)' : 'var(--color-border)' }} fill={i() < review.rating ? 'var(--color-warning)' : 'none'} />
                            )}</For>
                          </div>
                        </div>
                        <Show when={review.comment}>
                          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>
                        </Show>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </section>
          </Show>

          {/* Recent activity timeline */}
          <Show when={activities().length > 0}>
            <section>
              <h2 class="flex items-center gap-2 text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                <TrendingUp size={18} class="eq-brand" /> Atividade Recente
              </h2>
              <Card class="p-4 sm:p-6">
                <div class="relative">
                  {/* vertical connector line */}
                  <div
                    class="absolute left-[15px] top-2 bottom-2 w-0.5"
                    style={{ background: 'var(--color-primary-light)' }}
                  />
                  <ul class="space-y-4">
                    <For each={activities()}>
                      {(activity) => {
                        const Icon = activityIcon(activity.type);
                        const target = activityTarget(activity);
                        const clickable = !!target;
                        return (
                          <li class="relative flex items-start gap-3">
                            <div
                              class="relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary, #2563eb)',
                              }}
                            >
                              <Icon size={15} />
                            </div>
                            <div class="flex-1 min-w-0 pt-0.5">
                              <Show
                                when={clickable}
                                fallback={
                                  <p class="text-sm" style={{ color: 'var(--color-text)' }}>
                                    {activityLabel(activity)}
                                  </p>
                                }
                              >
                                <button
                                  type="button"
                                  class="text-sm text-left eq-link cursor-pointer hover:underline"
                                  onClick={() => navigate(target!)}
                                >
                                  {activityLabel(activity)}
                                </button>
                              </Show>
                              <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                {formatRelativeTime(activity.createdAt)}
                              </p>
                            </div>
                          </li>
                        );
                      }}
                    </For>
                  </ul>
                </div>
              </Card>
            </section>
          </Show>

          {/* Empty state */}
          <Show when={products().length === 0 && services().length === 0 && communities().length === 0 && activities().length === 0}>
            <Card class="p-8 text-center">
              <p style={{ color: 'var(--color-text-muted)' }}>Este usuário ainda não publicou conteúdo.</p>
            </Card>
          </Show>
        </div>
      ) : (
        <Card class="p-8 text-center">
          <p style={{ color: 'var(--color-text-muted)' }}>Usuário não encontrado.</p>
        </Card>
      )}
    </div>
  );
};

export default UserProfilePage;
