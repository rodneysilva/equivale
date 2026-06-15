import { type Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Plus } from 'lucide-solid';
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
  const [tag, setTag] = createSignal('');
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [facets, setFacets] = createSignal<FacetResult>({ categories: {}, tags: {} });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll(page(), 12, category() || undefined, search() || undefined, tag() || undefined);
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  onMount(async () => {
    try {
      const [f] = await Promise.all([searchService.getProductFacets()]);
      setFacets(f);
    } catch { /* ignore */ }
    loadProducts();
  });

  const reload = () => { setPage(1); };

  const handleSearch = (value: string) => { setSearch(value); reload(); };
  const handleCategory = (cat: string) => { setCategory(cat); reload(); };
  const handleTag = (t: string) => { setTag(t); reload(); };
  const handlePage = (newPage: number) => { setPage(newPage); };

  // Reload when any filter changes
  createEffect(() => {
    category(); search(); tag(); page();
    if (!loading()) loadProducts();
  });

  const activeFilters = () => {
    const f: string[] = [];
    if (category()) f.push(`Categoria: ${category()}`);
    if (tag()) f.push(`Tag: #${tag()}`);
    if (search()) f.push(`Busca: "${search()}"`);
    return f;
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Produtos</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Explore produtos disponíveis</p>
        </div>
        <Button onClick={() => navigate('/products/new')}>
          <Plus size={16} class="mr-1.5" />
          Publicar
        </Button>
      </div>

      <Show when={activeFilters().length > 0}>
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Filtros ativos:</span>
          <For each={activeFilters()}>
            {(f) => (
              <span class="eq-badge eq-badge-primary">{f}</span>
            )}
          </For>
          <button onClick={() => { setCategory(''); setTag(''); setSearch(''); reload(); }} class="text-xs eq-link">
            Limpar
          </button>
        </div>
      </Show>

      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-52 shrink-0">
          <div class="lg:sticky space-y-3" style={{ top: '7rem' }}>
            <Card class="p-3">
              <SearchBar value={search()} onInput={handleSearch} placeholder="Buscar..." />
            </Card>
            <CategoryFilter categories={facets().categories} selected={category()} onSelect={handleCategory} />
            <TagFilter tags={facets().tags} selected={tag()} onSelect={handleTag} />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <ProductGrid products={products()} isLoading={loading()} />
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => handlePage(Math.max(1, page() - 1))} disabled={page() <= 1} class="eq-btn eq-btn-outline eq-btn-sm">
                Anterior
              </button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => handlePage(Math.min(totalPages(), page() + 1))} disabled={page() >= totalPages()} class="eq-btn eq-btn-outline eq-btn-sm">
                Próximo
              </button>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
