import { type Component, createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { Zap, ArrowLeft, Tag, User } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { servicesService } from '../services/services.service';
import { useAuth } from '../store/auth';
import type { Service } from '../types';

const ServiceDetailPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [service, setService] = createSignal<Service | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [hiring, setHiring] = createSignal(false);

  createEffect(() => {
    loadService();
  });

  const loadService = async () => {
    setLoading(true);
    try {
      const data = await servicesService.getById(params.id);
      setService(data);
    } catch {
      setError('Serviço não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setHiring(true);
    try {
      await servicesService.hire(params.id);
      navigate('/wallet');
    } catch (err: any) {
      setError(err.message || 'Erro ao contratar');
    } finally {
      setHiring(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : error() ? (
        <GlassCard class="p-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">{error()}</p>
        </GlassCard>
      ) : service() ? (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service details */}
          <div class="lg:col-span-2 space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Badge variant="primary">
                  <Tag size={12} class="mr-1" />
                  {service()!.category}
                </Badge>
                <Badge variant={service()!.status === 'available' ? 'success' : 'info'}>
                  {service()!.status === 'available' ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{service()!.title}</h1>
            </div>

            <GlassCard class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descrição</h2>
              <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{service()!.description}</p>
            </GlassCard>

            {service()!.providerName && (
              <GlassCard class="p-4">
                <div class="flex items-center gap-3">
                  <Avatar name={service()!.providerName} size="md" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{service()!.providerName}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Prestador de serviço</p>
                  </div>
                </div>
              </GlassCard>
            )}

            <GlassCard class="p-4">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Criado em {formatDate(service()!.createdAt)}
                {service()!.updatedAt !== service()!.createdAt && (
                  <> · Atualizado em {formatDate(service()!.updatedAt)}</>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Purchase sidebar */}
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-24 space-y-4">
              <GlassCard class="p-6 text-center">
                <div class="flex items-baseline justify-center gap-2 mb-6">
                  <span class="text-4xl font-bold gradient-text">{service()!.price}</span>
                  <span class="text-xl text-gray-500 dark:text-gray-400 font-medium">EQL</span>
                </div>
                <LiquidButton
                  size="lg"
                  class="w-full"
                  onClick={handleHire}
                  disabled={hiring() || service()!.status !== 'available'}
                >
                  {hiring() ? (
                    <LoadingSpinner size="w-5 h-5" class="!justify-start" />
                  ) : (
                    <>
                      <Zap size={20} class="mr-2" />
                      Contratar Serviço
                    </>
                  )}
                </LiquidButton>
              </GlassCard>

              {error() && (
                <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {error()}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ServiceDetailPage;
