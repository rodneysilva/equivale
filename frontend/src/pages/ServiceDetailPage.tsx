import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Zap, ArrowLeft, Tag, Users } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { servicesService } from '../services/services.service';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import type { Service } from '../types';

const ServiceDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [service, setService] = createSignal<Service | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [hiring, setHiring] = createSignal(false);

  createEffect(() => { loadService(); });

  const loadService = async () => {
    setLoading(true);
    try { setService(await servicesService.getById(params.id)); }
    catch { setError('Serviço não encontrado'); }
    finally { setLoading(false); }
  };

  const handleHire = async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    setHiring(true);
    setError('');
    try {
      await transactionsService.create(params.id, 'Service', 1);
      navigate('/transactions');
    } catch (err: any) { setError(err.message || 'Erro ao contratar'); }
    finally { setHiring(false); }
  };

  const isOwnService = () => auth.currentUser()?.id === service()?.providerId;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-6">
        <ArrowLeft size={14} /> Voltar
      </button>
      {loading() ? <LoadingSpinner class="py-20" /> : error() ? (
        <Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>{error()}</p></Card>
      ) : service() ? (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-5">
            {/* Image */}
            <div class="aspect-video rounded-lg overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
              <Show when={service()!.imageUrl} fallback={
                <div class="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface-alt))' }}>
                  <Zap size={48} style={{ color: 'var(--color-primary)' }} />
                </div>
              }>
                <img src={service()!.imageUrl} alt={service()!.title} class="w-full h-full object-cover" />
              </Show>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Badge variant="primary"><Tag size={10} class="mr-1" />{service()!.category}</Badge>
                <Badge variant={service()!.status === 'available' ? 'success' : 'info'}>
                  {service()!.status === 'available' ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
              <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{service()!.title}</h1>
            </div>
            {service()!.communityName && (
              <button
                onClick={() => service()!.communityId && navigate(`/communities/${service()!.communityId}`)}
                class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-colors"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
              >
                <Users size={11} />
                {service()!.communityName}
                <span style={{ opacity: 0.6 }}>· ver comunidade</span>
              </button>
            )}
            {service()!.tags && service()!.tags!.length > 0 && (
              <div class="flex flex-wrap gap-1.5">
                <For each={service()!.tags}>
                  {(tag) => (
                    <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                      #{tag}
                    </span>
                  )}
                </For>
              </div>
            )}
            <Card class="p-5">
              <h2 class="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Descrição</h2>
              <p class="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>{service()!.description}</p>
            </Card>
            {service()!.providerName && (
              <Card class="p-3">
                <div class="flex items-center gap-3">
                  <Avatar name={service()!.providerName} size="md" />
                  <div>
                    <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{service()!.providerName}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Prestador</p>
                  </div>
                </div>
              </Card>
            )}
            <Card class="p-3">
              <div class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Criado em {formatDate(service()!.createdAt)}
                {service()!.updatedAt !== service()!.createdAt && <> · Atualizado em {formatDate(service()!.updatedAt)}</>}
              </div>
            </Card>
          </div>
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-20 space-y-4">
              <Card class="p-5 text-center">
                <div class="flex items-baseline justify-center gap-2 mb-5">
                  <span class="text-3xl font-bold eq-accent">{service()!.price}</span>
                  <span class="text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
                </div>
                <Button size="lg" class="w-full" onClick={handleHire} disabled={hiring() || isOwnService()}>
                  {hiring() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : isOwnService() ? 'Seu serviço' : (
                    <><Zap size={16} class="mr-2" /> Contratar</>
                  )}
                </Button>
              </Card>
              {error() && (
                <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ServiceDetailPage;
