import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Package } from 'lucide-solid';
import ProductGrid from '../components/marketplace/ProductGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { communitiesService } from '../services/communities.service';
import type { Product, Community } from '../types';

const CommunityProductsPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = createSignal<Community | null>(null);
  const [products, setProducts] = createSignal<Product[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  onMount(async () => {
    try {
      setCommunity(await communitiesService.getById(params.id));
      await loadProducts();
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const loadProducts = async () => {
    try {
      const res = await productsService.getAll(page(), 24, undefined, undefined, undefined, undefined, params.id);
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch { /* ignore */ }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Voltar para a comunidade
      </button>

      <h1 class="flex items-center gap-2 text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        <Package size={20} class="eq-brand" />
        {community()?.name ? `Produtos — ${community()!.name}` : 'Produtos da comunidade'}
      </h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <>
          <ProductGrid products={products()} emptyMessage="Nenhum produto nesta comunidade." />
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); loadProducts(); }} disabled={page() <= 1} class="eq-btn eq-btn-outline eq-btn-sm">Anterior</button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => { setPage(p => Math.min(totalPages(), p + 1)); loadProducts(); }} disabled={page() >= totalPages()} class="eq-btn eq-btn-outline eq-btn-sm">Próximo</button>
            </div>
          </Show>
        </>
      )}
    </div>
  );
};

export default CommunityProductsPage;
