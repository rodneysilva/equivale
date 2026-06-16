import { type Component, createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Trash2 } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService } from '../../services/admin.service';
import { api } from '../../services/api';
import { mapService, type BackendServiceDto, type BackendPagedResult } from '../../services/mappers';
import type { Service } from '../../types';

const AdminServicesPage: Component = () => {
  const navigate = useNavigate();
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const raw = await api.get<BackendPagedResult<BackendServiceDto>>('/services?page=1&pageSize=100');
      setServices(raw.items.map(mapService));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const remove = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await adminService.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Serviços ({services().length})</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="space-y-2">
          <For each={services()}>
            {(service) => (
              <Card class="p-3 flex items-center gap-3">
                <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.title} class="w-full h-full object-cover" />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
                      {service.category[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{service.title}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {service.category} · {service.price} EQL · {service.providerName || '—'}
                  </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => remove(service.id)} style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
