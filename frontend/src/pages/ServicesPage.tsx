import { type Component, createSignal, createEffect } from 'solid-js';
import { servicesService } from '../services/services.service';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import GlassCard from '../components/ui/GlassCard';
import type { Service } from '../types';

const categories = ['Design', 'Programação', 'Marketing', 'Escrita', 'Consultoria', 'Aulas', 'Fotografia', 'Outros'];

const ServicesPage: Component = () => {
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  createEffect(() => {
    loadServices();
  });

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await servicesService.getAll(page(), 12, category() || undefined, search() || undefined);
      setServices(res.data);
      setTotalPages(res.totalPages);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Serviços</h1>
        <p class="text-gray-500 dark:text-gray-400">Encontre talentos e serviços na comunidade</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <div class="lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-24 space-y-4">
            <GlassCard class="p-4">
              <SearchBar value={search()} onInput={handleSearch} placeholder="Buscar serviços..." />
            </GlassCard>
            <CategoryFilter
              categories={categories}
              selected={category()}
              onSelect={handleCategory}
            />
          </div>
        </div>

        {/* Services grid */}
        <div class="flex-1">
          <ServiceGrid services={services()} isLoading={loading()} />

          {/* Pagination */}
          {totalPages() > 1 && (
            <div class="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page() <= 1}
                class="px-4 py-2 rounded-xl text-sm font-medium glass-card disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Anterior
              </button>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {page()} de {totalPages()}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages(), p + 1))}
                disabled={page() >= totalPages()}
                class="px-4 py-2 rounded-xl text-sm font-medium glass-card disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
