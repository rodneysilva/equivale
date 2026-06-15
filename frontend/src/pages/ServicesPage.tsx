import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Plus } from 'lucide-solid';
import { servicesService } from '../services/services.service';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Service } from '../types';

const categories = ['Design', 'Programação', 'Marketing', 'Escrita', 'Consultoria', 'Aulas', 'Fotografia', 'Outros'];

const ServicesPage: Component = () => {
  const navigate = useNavigate();
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  createEffect(() => { loadServices(); });

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await servicesService.getAll(page(), 12, category() || undefined, search() || undefined);
      setServices(res.data);
      setTotalPages(res.totalPages);
    } catch { setServices([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleCategory = (cat: string) => { setCategory(cat); setPage(1); };

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Serviços</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Encontre talentos e serviços</p>
        </div>
        <Button onClick={() => navigate('/services/new')}>
          <Plus size={16} class="mr-1.5" />
          Oferecer serviço
        </Button>
      </div>
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-56 shrink-0">
          <div class="lg:sticky lg:top-20 space-y-4">
            <Card class="p-3">
              <SearchBar value={search()} onInput={handleSearch} placeholder="Buscar serviços..." />
            </Card>
            <CategoryFilter categories={categories} selected={category()} onSelect={handleCategory} />
          </div>
        </div>
        <div class="flex-1">
          <ServiceGrid services={services()} isLoading={loading()} />
          {totalPages() > 1 && (
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page() <= 1} class="eq-btn eq-btn-outline eq-btn-sm">Anterior</button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => setPage(p => Math.min(totalPages(), p + 1))} disabled={page() >= totalPages()} class="eq-btn eq-btn-outline eq-btn-sm">Próximo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
