import { type Component, createSignal, createEffect, on, onMount, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Plus, X, BriefcaseBusiness } from 'lucide-solid';
import { servicesService } from '../services/services.service';
import { searchService, type FacetResult } from '../services/search.service';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import TagFilter from '../components/marketplace/TagFilter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../store/toast';
import type { Service } from '../types';

const ServicesPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [tags, setTags] = createSignal<string[]>([]);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [total, setTotal] = createSignal(0);
  const [facets, setFacets] = createSignal<FacetResult>({ categories: {}, tags: {} });
  const [sortBy, setSortBy] = createSignal('recent');
  const [pageSize, setPageSize] = createSignal(24);
  const communityId = (searchParams.communityId as string) || undefined;

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await servicesService.getAll(page(), pageSize(), category() || undefined, search() || undefined, tags().length > 0 ? tags() : undefined, undefined, communityId, sortBy());
      setServices(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      toast.error('Não foi possível carregar os serviços.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFacets = async () => {
    try {
      setFacets(await searchService.getServiceFacets(category() || undefined, tags().length > 0 ? tags() : undefined));
    } catch { /* ignore */ }
  };

  onMount(async () => {
    await loadFacets();
    await loadServices();
  });

  createEffect(on(() => [category(), search(), tags().join(','), page(), sortBy(), pageSize()], () => { loadServices(); }, { defer: true }));
  createEffect(on(() => [category(), tags().join(',')], () => { loadFacets(); }, { defer: true }));

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCategory = (c: string) => { setCategory(c); setPage(1); };
  const handleTag = (t: string) => {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    setPage(1);
  };

  const activeFilters = () => {
    const f: string[] = [];
    if (category()) f.push(`Categoria: ${category()}`);
    if (tags().length > 0) f.push(`Tags: ${tags().map(t => '#' + t).join(', ')}`);
    if (search()) f.push(`Busca: "${search()}"`);
    return f;
  };

  const clearFilters = () => { setCategory(''); setTags([]); setSearch(''); setPage(1); };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Intro / hero da seção */}
      <section class="eq-card p-6 sm:p-8 mb-8" style={{ background: 'var(--color-service-bg, var(--color-primary-light))', border: '1px solid var(--color-border)' }}>
        <div class="flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="flex-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'var(--color-surface)', color: 'var(--color-service)' }}>
              <BriefcaseBusiness size={12} /> Talentos da comunidade
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold eq-display" style={{ color: 'var(--color-text)' }}>
              Serviços que <span style={{ color: 'var(--color-service)' }}>movimentam</span> a economia
            </h1>
            <p class="text-sm sm:text-base mt-3 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              Design, aulas, consultoria, reparos e muito mais — pagos em EQL.
              Contrate pessoas da sua comunidade ou <strong style={{ color: 'var(--color-text)' }}>ofereça seu talento</strong> e receba por ele.
            </p>
            <div class="flex flex-wrap gap-2 mt-5">
              <Button onClick={() => navigate('/services/new')}>
                <Plus size={16} class="mr-1.5" /> Oferecer serviço
              </Button>
            </div>
          </div>
          <div class="lg:w-56 shrink-0">
            <div class="eq-card p-4 text-center">
              <div class="text-2xl font-bold" style={{ color: 'var(--color-service)' }}>{total()}</div>
              <div class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>serviços disponíveis</div>
            </div>
          </div>
        </div>
      </section>

      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Todos os serviços</h2>
        <span class="eq-badge eq-badge-info">{total()} no total</span>
      </div>

      <Show when={activeFilters().length > 0}>
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Filtros:</span>
          <For each={activeFilters()}>{(f) => <span class="eq-badge eq-badge-primary">{f}</span>}</For>
          <button onClick={clearFilters} class="text-xs eq-link flex items-center gap-1">
            <X size={11} /> Limpar
          </button>
        </div>
      </Show>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-52 shrink-0">
          <div class="lg:sticky space-y-3" style={{ top: '7rem' }}>
            <Card class="p-3"><SearchBar value={search()} onInput={handleSearch} placeholder="Buscar..." /></Card>
            <CategoryFilter categories={facets().categories} selected={category()} onSelect={handleCategory} />
            <TagFilter tags={facets().tags} selected={tags()} onSelect={handleTag} />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Itens por página:</span>
              <select value={pageSize()} onChange={(e) => { setPageSize(Number(e.currentTarget.value)); setPage(1); }} class="eq-input text-xs py-1 w-auto">
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
                <option value="60">60</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ordenar:</span>
              <select value={sortBy()} onChange={(e) => { setSortBy(e.currentTarget.value); setPage(1); }} class="eq-input text-xs py-1 w-auto">
                <option value="recent">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
              </select>
            </div>
          </div>
          <ServiceGrid services={services()} isLoading={loading()} />
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page() <= 1} class="eq-btn-outline eq-btn-sm px-3 py-1.5 rounded text-sm">Anterior</button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => setPage(p => Math.min(totalPages(), p + 1))} disabled={page() >= totalPages()} class="eq-btn-outline eq-btn-sm px-3 py-1.5 rounded text-sm">Próximo</button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
