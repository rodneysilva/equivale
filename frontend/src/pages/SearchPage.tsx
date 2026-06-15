import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Search, Package, Zap, Users, ArrowRight } from 'lucide-solid';
import { searchService, type UnifiedSearchResult } from '../services/search.service';
import ProductCard from '../components/marketplace/ProductCard';
import ServiceCard from '../components/marketplace/ServiceCard';
import CommunityCard from '../components/community/CommunityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const SearchPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = createSignal((searchParams.q as string) || '');
  const [results, setResults] = createSignal<UnifiedSearchResult | null>(null);
  const [loading, setLoading] = createSignal(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await searchService.searchFull(q.trim());
      setResults(res);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => { if (term().trim()) doSearch(term()); });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const q = term().trim();
    setSearchParams({ q }, { replace: false });
    doSearch(q);
  };

  const totalResults = () => {
    const r = results();
    if (!r) return 0;
    return r.products.length + r.services.length + r.communities.length;
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search header */}
      <form onSubmit={handleSubmit} class="mb-8">
        <div class="relative max-w-2xl">
          <input
            type="text"
            value={term()}
            onInput={(e) => setTerm(e.currentTarget.value)}
            placeholder="Buscar produtos, serviços, comunidades..."
            class="eq-input pr-10 h-12 text-base"
            autofocus
          />
          <button type="submit" class="absolute right-0 top-0 bottom-0 px-4 flex items-center eq-btn-ghost" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <Search size={20} />
          </button>
        </div>
      </form>

      <Show when={loading()}>
        <LoadingSpinner class="py-20" />
      </Show>

      <Show when={!loading() && results() && totalResults() === 0}>
        <Card class="p-12 text-center">
          <Search size={32} class="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <h2 class="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Nenhum resultado encontrado
          </h2>
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Tente buscar com outros termos
          </p>
        </Card>
      </Show>

      <Show when={!loading() && results() && totalResults() > 0}>
        {/* Summary */}
        <div class="mb-6 flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span>{totalResults()} resultado(s) para</span>
          <span class="font-semibold" style={{ color: 'var(--color-text)' }}>"{searchParams.q}"</span>
        </div>

        {/* Products */}
        <Show when={results()!.products.length > 0}>
          <section class="mb-10">
            <div class="flex items-end justify-between mb-4">
              <h2 class="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                <Package size={18} class="eq-brand" />
                Produtos
                <span class="text-sm font-normal eq-badge eq-badge-primary">{results()!.products.length}</span>
              </h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <For each={results()!.products}>
                {(item) => (
                  <ProductCard product={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    imageUrl: item.imageUrl || undefined,
                    sellerId: '',
                    sellerName: item.authorName || undefined,
                    condition: 'new',
                    status: 'available',
                    createdAt: '',
                    updatedAt: '',
                  }} />
                )}
              </For>
            </div>
          </section>
        </Show>

        {/* Services */}
        <Show when={results()!.services.length > 0}>
          <section class="mb-10">
            <div class="flex items-end justify-between mb-4">
              <h2 class="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                <Zap size={18} class="eq-brand" />
                Serviços
                <span class="text-sm font-normal eq-badge eq-badge-primary">{results()!.services.length}</span>
              </h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <For each={results()!.services}>
                {(item) => (
                  <ServiceCard service={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    providerId: '',
                    providerName: item.authorName || undefined,
                    status: 'available',
                    createdAt: '',
                    updatedAt: '',
                  }} />
                )}
              </For>
            </div>
          </section>
        </Show>

        {/* Communities */}
        <Show when={results()!.communities.length > 0}>
          <section class="mb-10">
            <div class="flex items-end justify-between mb-4">
              <h2 class="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                <Users size={18} class="eq-brand" />
                Comunidades
                <span class="text-sm font-normal eq-badge eq-badge-primary">{results()!.communities.length}</span>
              </h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={results()!.communities}>
                {(item) => (
                  <CommunityCard community={{
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    imageUrl: item.imageUrl || undefined,
                    ownerId: '',
                    membersCount: item.membersCount,
                    postsCount: 0,
                    type: 'open',
                    moderators: [],
                    productVisibility: 'public',
                    createdAt: '',
                  }} />
                )}
              </For>
            </div>
          </section>
        </Show>
      </Show>

      {/* Empty state (no search yet) */}
      <Show when={!loading() && !results()}>
        <Card class="p-12 text-center">
          <Search size={32} class="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Digite algo na busca acima para encontrar produtos, serviços e comunidades
          </p>
        </Card>
      </Show>
    </div>
  );
};

export default SearchPage;
