import { type Component, createSignal, onMount, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Zap } from 'lucide-solid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { servicesService } from '../services/services.service';
import { communitiesService } from '../services/communities.service';
import type { Service, Community } from '../types';

const CommunityServicesPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = createSignal<Community | null>(null);
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  onMount(async () => {
    try {
      setCommunity(await communitiesService.getById(params.id));
      await loadServices();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const loadServices = async () => {
    try {
      const res = await servicesService.getAll(page(), 24, undefined, undefined, undefined, undefined, params.id);
      setServices(res.data);
      setTotalPages(res.totalPages);
    } catch { /* ignore */ }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Voltar para a comunidade
      </button>

      <h1 class="flex items-center gap-2 text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        <Zap size={20} class="eq-brand" />
        {community()?.name ? `Serviços — ${community()!.name}` : 'Serviços da comunidade'}
      </h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <>
          <ServiceGrid services={services()} emptyTitle="Nenhum serviço nesta comunidade." />
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); loadServices(); }} disabled={page() <= 1} class="eq-btn eq-btn-outline eq-btn-sm">Anterior</button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => { setPage(p => Math.min(totalPages(), p + 1)); loadServices(); }} disabled={page() >= totalPages()} class="eq-btn eq-btn-outline eq-btn-sm">Próximo</button>
            </div>
          </Show>
        </>
      )}
    </div>
  );
};

export default CommunityServicesPage;
