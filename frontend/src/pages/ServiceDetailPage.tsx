import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Zap, ArrowLeft, Tag, Users, PenLine, Trash2 } from 'lucide-solid';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { servicesService } from '../services/services.service';
import { transactionsService } from '../services/transactions.service';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { Service, Review } from '../types';

const ServiceDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [service, setService] = createSignal<Service | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [hiring, setHiring] = createSignal(false);
  const [reviews, setReviews] = createSignal<Review[]>([]);
  const [providerServiceCount, setProviderServiceCount] = createSignal(0);
  const [selectedImage, setSelectedImage] = createSignal('');
  const [showConfirm, setShowConfirm] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  createEffect(() => {
    loadService();
    loadReviews();
  });

  const loadService = async () => {
    setLoading(true);
    try {
      const s = await servicesService.getById(params.id);
      setService(s);
      setSelectedImage(s.imageUrl || '');
      loadProviderInfo(s.providerId);
    }
    catch { setError('Serviço não encontrado'); }
    finally { setLoading(false); }
  };

  const loadReviews = async () => {
    try {
      const data = await api.get<Review[]>(`/reviews?itemId=${params.id}&itemType=Service`);
      setReviews(data);
    } catch { /* silently fail */ }
  };

  const loadProviderInfo = async (providerId?: string) => {
    try {
      const id = providerId || service()?.providerId;
      if (id) {
        const providerServices = await servicesService.getByProvider(id);
        setProviderServiceCount(providerServices.length);
      }
    } catch { /* silently fail */ }
  };

  const handleHire = async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    setHiring(true);
    setError('');
    try {
      await transactionsService.create(params.id, 'Service', 1);
      toast.success('Serviço contratado!');
      navigate('/transactions');
    } catch (err: any) { toast.error(err.message || 'Erro ao contratar'); }
    finally { setHiring(false); }
  };

  const isOwnService = () => auth.currentUser()?.id === service()?.providerId;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDelete = async () => {
    try {
      await servicesService.delete(params.id);
      toast.success('Serviço excluído.');
      navigate('/services');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir serviço');
    }
  };

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
              <Show when={selectedImage()} fallback={
                <div class="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface-alt))' }}>
                  <Zap size={48} style={{ color: 'var(--color-primary)' }} />
                </div>
              }>
                <img src={selectedImage()} alt={service()!.title} class="w-full h-full object-cover" />
              </Show>
            </div>
            <Show when={service()!.images && service()!.images!.length > 1}>
              <div class="flex gap-2 overflow-x-auto pb-1">
                <For each={service()!.images!}>
                  {(img) => (
                    <button onClick={() => setSelectedImage(img)} class="flex-shrink-0">
                      <img src={img} alt="" class="w-16 h-16 rounded object-cover border-2 transition-colors" style={{ 'border-color': selectedImage() === img ? 'var(--color-primary)' : 'var(--color-border)' }} />
                    </button>
                  )}
                </For>
              </div>
            </Show>
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
            <Show when={reviews().length > 0}>
              <Card class="p-4">
                <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Avaliações ({reviews().length})</h3>
                <div class="space-y-3">
                  <For each={reviews()}>
                    {(review) => (
                      <div class="pb-3" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
                        <div class="flex items-center gap-2 mb-1">
                          {review.reviewerName ? (
                            <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{review.reviewerName}</span>
                          ) : (
                            <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Anônimo</span>
                          )}
                          <StarRating rating={review.rating} size={10} />
                        </div>
                        {review.comment && <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>}
                        <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </For>
                </div>
              </Card>
            </Show>
            {service()!.providerName && (
              <Card class="p-4">
                <div class="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/users/${service()!.providerId}`)}>
                  <Avatar name={service()!.providerName} size="md" />
                  <div class="flex-1">
                    <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{service()!.providerName}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Prestador{providerServiceCount() > 0 ? ` · ${providerServiceCount()} serviço${providerServiceCount() !== 1 ? 's' : ''}` : ''}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" class="w-full" onClick={() => navigate(`/users/${service()!.providerId}`)}>
                  Ver perfil
                </Button>
              </Card>
            )}
            <Show when={isOwnService()}>
              <Card class="p-4">
                <p class="text-sm text-center mb-3" style={{ color: 'var(--color-text-muted)' }}>Este é o seu serviço</p>
                <div class="flex gap-2">
                  <Button variant="outline" class="flex-1" onClick={() => navigate(`/services/${service()!.id}/edit`)}>
                    <PenLine size={14} class="mr-2" /> Editar
                  </Button>
                  <Button variant="outline" class="flex-1" onClick={() => setShowDeleteConfirm(true)} style={{ color: '#dc2626', 'border-color': '#dc2626' }}>
                    <Trash2 size={14} class="mr-2" /> Excluir
                  </Button>
                </div>
              </Card>
            </Show>
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
                <Button size="lg" class="w-full" onClick={() => { if (!auth.isAuthenticated()) { navigate('/login'); return; } setError(''); setShowConfirm(true); }} disabled={hiring() || isOwnService()}>
                  {hiring() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : isOwnService() ? 'Seu serviço' : (
                    <><Zap size={16} class="mr-2" /> Contratar</>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmação de contratação */}
      <Show when={showConfirm() && service()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowConfirm(false)}>
          <div class="eq-card p-6 max-w-md w-full" style={{ 'box-shadow': 'var(--shadow-md)' }} onClick={(e) => e.stopPropagation()}>
            <h2 class="text-lg font-bold mb-3" style={{ color: 'var(--color-text)' }}>Confirmar contratação</h2>
            <p class="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Deseja contratar o serviço <strong style={{ color: 'var(--color-text)' }}>{service()!.title}</strong> por <strong class="eq-accent">{service()!.price} EQL</strong>?
            </p>
            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button class="flex-1" onClick={handleHire} disabled={hiring()}>
                {hiring() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteConfirm()} onClose={() => setShowDeleteConfirm(false)} title="Excluir serviço" size="sm">
        <p class="text-sm eq-text-secondary mb-4">Tem certeza que deseja excluir "{service()?.title}"? Esta ação não pode ser desfeita.</p>
        <div class="flex gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button onClick={handleDelete} style={{ background: '#dc2626' }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetailPage;
