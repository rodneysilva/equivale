import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Search, Package, Zap, Users } from 'lucide-solid';
import { searchService, type UnifiedSearchResult } from '../../services/search.service';

const SearchBar: Component = () => {
  const navigate = useNavigate();
  const [term, setTerm] = createSignal('');
  const [results, setResults] = createSignal<UnifiedSearchResult | null>(null);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let containerRef: HTMLDivElement | undefined;

  createEffect(() => {
    const q = term().trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.searchAll(q, 4);
        setResults(res);
        setShowDropdown(true);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const q = term().trim();
    setShowDropdown(false);
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const hasResults = () => {
    const r = results();
    return r && (r.products.length > 0 || r.services.length > 0 || r.communities.length > 0);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <div class="relative flex-1 max-w-2xl" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div class="relative">
          <input
            type="text"
            value={term()}
            onInput={(e) => setTerm(e.currentTarget.value)}
            onFocus={() => results() && setShowDropdown(true)}
            onBlur={handleBlur}
            placeholder="Buscar produtos, serviços, comunidades..."
            class="eq-input pr-10 h-10"
          />
          <button type="submit" class="absolute right-0 top-0 bottom-0 px-3 flex items-center eq-btn-ghost" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <Search size={18} />
          </button>
        </div>
      </form>

      <Show when={showDropdown() && term().trim().length >= 2}>
        <div class="absolute top-full left-0 right-0 mt-1 eq-card overflow-hidden z-50" style={{ boxShadow: 'var(--shadow-md)', 'max-height': '70vh', overflow: 'auto' }}>
          <Show when={loading()}>
            <div class="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Buscando...</div>
          </Show>

          <Show when={!loading() && !hasResults()}>
            <div class="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhum resultado encontrado</div>
          </Show>

          <Show when={results()?.products.length}>
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Package size={11} class="inline mr-1" /> Produtos
            </div>
            <For each={results()!.products}>
              {(item) => (
                <button
                  onMouseDown={() => { setShowDropdown(false); navigate(`/products/${item.id}`); }}
                  class="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-alt)] text-left cursor-pointer"
                >
                  <div class="w-10 h-10 rounded shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" class="w-full h-full object-cover" />
                    ) : (
                      <Package size={16} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.category} · {item.description}</p>
                  </div>
                  <span class="text-sm font-bold eq-accent shrink-0">{item.price} EQL</span>
                </button>
              )}
            </For>
          </Show>

          <Show when={results()?.services.length}>
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Zap size={11} class="inline mr-1" /> Serviços
            </div>
            <For each={results()!.services}>
              {(item) => (
                <button
                  onMouseDown={() => { setShowDropdown(false); navigate(`/services/${item.id}`); }}
                  class="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-alt)] text-left cursor-pointer"
                >
                  <div class="w-10 h-10 rounded shrink-0 flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                    <Zap size={16} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.category} · {item.description}</p>
                  </div>
                  <span class="text-sm font-bold eq-accent shrink-0">{item.price} EQL</span>
                </button>
              )}
            </For>
          </Show>

          <Show when={results()?.communities.length}>
            <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Users size={11} class="inline mr-1" /> Comunidades
            </div>
            <For each={results()!.communities}>
              {(item) => (
                <button
                  onMouseDown={() => { setShowDropdown(false); navigate(`/communities/${item.id}`); }}
                  class="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-alt)] text-left cursor-pointer"
                >
                  <div class="w-10 h-10 rounded shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" class="w-full h-full object-cover" />
                    ) : (
                      <span class="text-sm font-bold eq-brand">{item.name[0]}</span>
                    )}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.membersCount} membros · {item.description}</p>
                  </div>
                </button>
              )}
            </For>
          </Show>

          <Show when={hasResults()}>
            <button
              onMouseDown={() => handleSubmit(new Event('submit'))}
              class="w-full px-3 py-2.5 text-sm font-medium eq-link text-center cursor-pointer eq-divider"
            >
              Ver todos os resultados para "{term()}"
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default SearchBar;
