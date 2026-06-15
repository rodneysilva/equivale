import { type Component, createSignal, createEffect, on, onMount, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Plus, X } from 'lucide-solid';
import { productsService } from '../services/products.service';
import { searchService, type FacetResult } from '../services/search.service';
import ProductGrid from '../components/marketplace/ProductGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import TagFilter from '../components/marketplace/TagFilter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Product } from '../types';

const ProductsPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = createSignal<Product[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal((searchParams.search as string) || '');
  const [category, setCategory] = createSignal('');
  const [tags, setTags] = createSignal<string[]>([]);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [facets, setFacets] = createSignal<FacetResult>({ categories: {}, tags: {} });
  const [sortBy, setSortBy] = createSignal('recent');
  const communityId = (searchParams.communityId as string) || undefined;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll(page(), 24, category() || undefined, search() || undefined, tags().length > 0 ? tags() : undefined, undefined, communityId, sortBy());
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFacets = async () => {
    try {
      setFacets(await searchService.getProductFacets(category() || undefined, tags().length > 0 ? tags() : undefined));
    } catch { /* ignore */ }
  };

  onMount(async () => {
    await loadFacets();
    await loadProducts();
  });

  // Reload products when filters change
  createEffect(on(() => [category(), search(), tags().join(','), page(), sortBy()], () => { loadProducts(); }, { defer: true }));

  // Reload facets when category or tags change
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
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Produtos</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Explore produtos disponíveis</p>
        </div>
        <Button onClick={() => navigate('/products/new')}>
          <Plus size={16} class="mr-1.5" /> Publicar
        </Button>
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
          {/* Sort bar */}
          <div class="flex items-center justify-end gap-2 mb-4">
            <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ordenar:</span>
            <select value={sortBy()} onChange={(e) => { setSortBy(e.currentTarget.value); setPage(1); }} class="eq-input text-xs py-1 w-auto">
              <option value="recent">Mais recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
          <ProductGrid products={products()} isLoading={loading()} />
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

export default ProductsPage;
