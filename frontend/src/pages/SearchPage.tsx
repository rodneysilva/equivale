import { type Component, createSignal, onMount, createMemo, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Search, Package, Zap, Users, ChevronLeft, ChevronRight } from 'lucide-solid';
import { searchService, type UnifiedSearchResult } from '../services/search.service';
import ProductCard from '../components/marketplace/ProductCard';
import ServiceCard from '../components/marketplace/ServiceCard';
import CommunityCard from '../components/community/CommunityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const PAGE_SIZE = 24;

type SortMode = 'recent' | 'price_asc' | 'price_desc';

interface FlatResult {
  type: 'product' | 'service' | 'community';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price: number;
  category: string;
  authorName?: string;
  membersCount?: number;
  createdAt?: string;
}

const SearchPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = createSignal((searchParams.q as string) || '');
  const [results, setResults] = createSignal<UnifiedSearchResult | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [sort, setSort] = createSignal<SortMode>('recent');
  const [page, setPage] = createSignal(1);

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    setPage(1);
    try {
      const res = await searchService.searchFull(q.trim());
      setResults(res);
    } catch { setResults(null); }
    finally { setLoading(false); }
  };

  onMount(() => { if (term().trim()) doSearch(term()); });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const q = term().trim();
    setSearchParams({ q }, { replace: false });
    doSearch(q);
  };

  // Flatten all results into a single list
  const allResults = createMemo<FlatResult[]>(() => {
    const r = results();
    if (!r) return [];
    const items: FlatResult[] = [];
    for (const p of r.products) items.push({ type: 'product', id: p.id, title: p.title, description: p.description, imageUrl: p.imageUrl || undefined, price: p.price, category: p.category, authorName: p.authorName || undefined });
    for (const s of r.services) items.push({ type: 'service', id: s.id, title: s.title, description: s.description, imageUrl: s.imageUrl || undefined, price: s.price, category: s.category, authorName: s.authorName || undefined });
    for (const c of r.communities) items.push({ type: 'community', id: c.id, title: c.name, description: c.description, imageUrl: c.imageUrl || undefined, price: 0, category: 'Comunidade', membersCount: c.membersCount });
    return items;
  });

  // Sort results
  const sortedResults = createMemo(() => {
    const items = [...allResults()];
    switch (sort()) {
      case 'price_asc': return items.sort((a, b) => a.price - b.price);
      case 'price_desc': return items.sort((a, b) => b.price - a.price);
      default: return items;
    }
  });

  // Paginate
  const totalPages = createMemo(() => Math.max(1, Math.ceil(sortedResults().length / PAGE_SIZE)));
  const pagedResults = createMemo(() => {
    const start = (page() - 1) * PAGE_SIZE;
    return sortedResults().slice(start, start + PAGE_SIZE);
  });

  const handleSort = (mode: SortMode) => { setSort(mode); setPage(1); };

  const renderCard = (item: FlatResult) => {
    if (item.type === 'product') return <ProductCard product={{ id: item.id, title: item.title, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl, sellerId: '', sellerName: item.authorName, condition: 'new', status: 'available', createdAt: '', updatedAt: '' }} />;
    if (item.type === 'service') return <ServiceCard service={{ id: item.id, title: item.title, description: item.description, price: item.price, category: item.category, providerId: '', providerName: item.authorName, status: 'available', createdAt: '', updatedAt: '' }} />;
    return <CommunityCard community={{ id: item.id, name: item.title, description: item.description, imageUrl: item.imageUrl, ownerId: '', membersCount: item.membersCount || 0, postsCount: 0, type: 'open', moderators: [], productVisibility: 'public', createdAt: '' }} />;
  };

  const typeCount = (type: string) => allResults().filter(i => i.type === type).length;

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search header */}
      <form onSubmit={handleSubmit} class="mb-6">
        <div class="relative max-w-2xl">
          <input type="text" value={term()} onInput={(e) => setTerm(e.currentTarget.value)} placeholder="Buscar produtos, serviços, comunidades..." class="eq-input pr-10 h-12 text-base" autofocus />
          <button type="submit" class="absolute right-0 top-0 bottom-0 px-4 flex items-center eq-btn-ghost" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <Search size={20} />
          </button>
        </div>
      </form>

      <Show when={loading()}><LoadingSpinner class="py-20" /></Show>

      <Show when={!loading() && results() && allResults().length === 0}>
        <Card class="p-12 text-center">
          <Search size={32} class="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <h2 class="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Nenhum resultado encontrado</h2>
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Tente buscar com outros termos</p>
        </Card>
      </Show>

      <Show when={!loading() && results() && allResults().length > 0}>
        {/* Summary + controls */}
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span><strong style={{ color: 'var(--color-text)' }}>{allResults().length}</strong> resultado(s)</span>
            <span>·</span>
            <span class="flex items-center gap-1"><Package size={12} /> {typeCount('product')}</span>
            <span class="flex items-center gap-1"><Zap size={12} /> {typeCount('service')}</span>
            <Show when={typeCount('community') > 0}><span class="flex items-center gap-1"><Users size={12} /> {typeCount('community')}</span></Show>
          </div>

          {/* Sort */}
          <div class="flex items-center gap-2">
            <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ordenar:</span>
            <select value={sort()} onChange={(e) => handleSort(e.currentTarget.value as SortMode)} class="eq-input text-xs py-1 w-auto">
              <option value="recent">Mais recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
        </div>

        {/* Results grid */}
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <For each={pagedResults()}>{(item) => renderCard(item)}</For>
        </div>

        {/* Pagination */}
        <Show when={totalPages() > 1}>
          <div class="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page() <= 1} class="eq-btn-outline eq-btn-sm flex items-center gap-1 px-3 py-1.5 rounded text-sm">
              <ChevronLeft size={14} /> Anterior
            </button>
            <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Página <strong style={{ color: 'var(--color-text)' }}>{page()}</strong> de {totalPages()}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages(), p + 1))} disabled={page() >= totalPages()} class="eq-btn-outline eq-btn-sm flex items-center gap-1 px-3 py-1.5 rounded text-sm">
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </Show>
      </Show>

      <Show when={!loading() && !results()}>
        <Card class="p-12 text-center">
          <Search size={32} class="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Digite algo na busca acima para encontrar produtos, serviços e comunidades</p>
        </Card>
      </Show>
    </div>
  );
};

export default SearchPage;
