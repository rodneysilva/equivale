import { type Component, createSignal, createEffect, on, onMount, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Plus, X, Package } from 'lucide-solid';
import { productsService } from '../services/products.service';
import { searchService, type FacetResult } from '../services/search.service';
import ProductGrid from '../components/marketplace/ProductGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import TagFilter from '../components/marketplace/TagFilter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../store/toast';
import type { Product } from '../types';

const ProductsPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [products, setProducts] = createSignal<Product[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal((searchParams.search as string) || '');
  const [category, setCategory] = createSignal('');
  const [tags, setTags] = createSignal<string[]>([]);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [total, setTotal] = createSignal(0);
  const [facets, setFacets] = createSignal<FacetResult>({ categories: {}, tags: {} });
  const [sortBy, setSortBy] = createSignal('recent');
  const [pageSize, setPageSize] = createSignal(24);
  const communityId = (searchParams.communityId as string) || undefined;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll(page(), pageSize(), category() || undefined, search() || undefined, tags().length > 0 ? tags() : undefined, undefined, communityId, sortBy());
      setProducts(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      toast.error('Não foi possível carregar os produtos.');
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
  createEffect(on(() => [category(), search(), tags().join(','), page(), sortBy(), pageSize()], () => { loadProducts(); }, { defer: true }));

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
      {/* Intro / hero da seção */}
      <section class="eq-card p-6 sm:p-8 mb-8" style={{ background: 'var(--color-product-bg, var(--color-primary-light))', border: '1px solid var(--color-border)' }}>
        <div class="flex flex-col lg:flex-row lg:items-center gap-6">
          <div class="flex-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'var(--color-surface)', color: 'var(--color-product)' }}>
              <Package size={12} /> Marketplace solidário
            </div>
            <h1 class="text-3xl sm:text-4xl font-bold eq-display" style={{ color: 'var(--color-text)' }}>
              Trocas que <span style={{ color: 'var(--color-product)' }}>valorizam</span> o que você faz
            </h1>
            <p class="text-sm sm:text-base mt-3 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
              Produtos de artesãos, produtores e criadores — pagos em EQL, a moeda da comunidade.
              Encontre peças únicas ou <strong style={{ color: 'var(--color-text)' }}>publique o que você oferece</strong> e comece a trocar hoje.
            </p>
            <div class="flex flex-wrap gap-2 mt-5">
              <Button onClick={() => navigate('/products/new')}>
                <Plus size={16} class="mr-1.5" /> Publicar produto
              </Button>
            </div>
          </div>
          <div class="lg:w-56 shrink-0">
            <div class="eq-card p-4 text-center">
              <div class="text-2xl font-bold" style={{ color: 'var(--color-product)' }}>{total()}</div>
              <div class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>produtos disponíveis</div>
            </div>
          </div>
        </div>
      </section>

      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Todos os produtos</h2>
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
          {/* Sort + page size bar */}
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
