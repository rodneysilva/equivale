import { type Component, createSignal, For, Show } from 'solid-js';
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
  let abortCtrl: AbortController | undefined;

  const doSearch = (q: string) => {
    clearTimeout(debounceTimer);
    abortCtrl?.abort();
    abortCtrl = new AbortController();

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
    }, 400);
  };

  const onInput = (e: Event) => {
    const val = (e.currentTarget as HTMLInputElement).value;
    setTerm(val);
    if (val.trim().length >= 2) {
      doSearch(val.trim());
    } else {
      clearTimeout(debounceTimer);
      setResults(null);
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const q = term().trim();
    setShowDropdown(false);
    clearTimeout(debounceTimer);
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const hasResults = () => {
    const r = results();
    return r && (r.products.length > 0 || r.services.length > 0 || r.communities.length > 0);
  };

  const handleBlur = () => { setTimeout(() => setShowDropdown(false), 150); };
  const selectItem = (path: string) => { setShowDropdown(false); navigate(path); };

  return (
    <div class="relative w-full">
      <form onSubmit={handleSubmit}>
        <div class="relative">
          <input
            type="text"
            value={term()}
            onInput={onInput}
            onFocus={() => results() && setShowDropdown(true)}
            onBlur={handleBlur}
            placeholder="Buscar produtos, serviços, comunidades..."
            class="eq-input pr-10 h-10 w-full"
            autocomplete="off"
          />
          <button type="submit" class="absolute right-0 top-0 bottom-0 px-3 flex items-center eq-btn-ghost" style={{ borderLeft: '1px solid var(--color-border)' }}>
            <Search size={18} />
          </button>
        </div>
      </form>

      <Show when={showDropdown() && term().trim().length >= 2}>
        <div class="absolute top-full left-0 right-0 mt-1 eq-card overflow-hidden z-50" style={{ 'max-height': '70vh', 'overflow-y': 'auto', 'box-shadow': 'var(--shadow-md)' }}>
          <Show when={loading()}>
            <div class="px-3 py-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span class="eq-spinner inline-block w-4 h-4 mr-1" /> Buscando...
            </div>
          </Show>

          <Show when={!loading() && !hasResults()}>
            <div class="px-3 py-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Nenhum resultado para "{term()}"
            </div>
          </Show>

          <Show when={results()?.products.length}>
            <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Package size={10} class="inline mr-1" /> Produtos
            </div>
            <For each={results()!.products}>
              {(item) => (
                <button onMouseDown={() => selectItem(`/products/${item.id}`)} class="w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer" style={{ border: 'none', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-alt)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div class="w-9 h-9 rounded shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt="" class="w-full h-full object-cover" /> : <Package size={14} style={{ color: 'var(--color-text-muted)' }} />}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.category}</p>
                  </div>
                  <span class="text-xs font-bold eq-accent shrink-0">{item.price} EQL</span>
                </button>
              )}
            </For>
          </Show>

          <Show when={results()?.services.length}>
            <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Zap size={10} class="inline mr-1" /> Serviços
            </div>
            <For each={results()!.services}>
              {(item) => (
                <button onMouseDown={() => selectItem(`/services/${item.id}`)} class="w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer" style={{ border: 'none', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-alt)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div class="w-9 h-9 rounded shrink-0 flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                    <Zap size={14} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.category}</p>
                  </div>
                  <span class="text-xs font-bold eq-accent shrink-0">{item.price} EQL</span>
                </button>
              )}
            </For>
          </Show>

          <Show when={results()?.communities.length}>
            <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-alt)' }}>
              <Users size={10} class="inline mr-1" /> Comunidades
            </div>
            <For each={results()!.communities}>
              {(item) => (
                <button onMouseDown={() => selectItem(`/communities/${item.id}`)} class="w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer" style={{ border: 'none', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-alt)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div class="w-9 h-9 rounded shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt="" class="w-full h-full object-cover" /> : <span class="text-xs font-bold eq-brand">{item.name[0]}</span>}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                    <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{item.membersCount} membros</p>
                  </div>
                </button>
              )}
            </For>
          </Show>

          <Show when={hasResults()}>
            <button onMouseDown={() => handleSubmit(new Event('submit'))} class="w-full px-3 py-2 text-xs font-medium eq-link text-center cursor-pointer eq-divider" style={{ background: 'transparent', border: 'none' }}>
              Ver todos os resultados para "{term()}"
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default SearchBar;
