import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { Plus } from 'lucide-solid';
import { productsService } from '../services/products.service';
import ProductGrid from '../components/marketplace/ProductGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import TagFilter from '../components/marketplace/TagFilter';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Product } from '../types';

const categories = ['Artesanato', 'Fotografia', 'Arte', 'Madeira', 'Alimentação', 'Jardinagem', 'Tecnologia', 'Bem-estar'];
const popularTags = ['artesanato', 'ceramica', 'madeira', 'vegano', 'tecnologia', 'fotografia', 'yoga', 'manual'];

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

  createEffect(() => { loadProducts(); });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll(page(), 12, category() || undefined, search() || undefined, tag() || undefined);
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const handleSearch = (value: string) => { setSearch(value); setPage(1); };
  const handleCategory = (cat: string) => { setCategory(cat); setPage(1); };
  const handleTag = (t: string) => { setTag(t); setPage(1); };

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Produtos</h1>
          <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Explore produtos disponíveis</p>
        </div>
        <Button onClick={() => navigate('/products/new')}>
          <Plus size={16} class="mr-1.5" />
          Publicar produto
        </Button>
      </div>
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-56 shrink-0">
          <div class="lg:sticky lg:top-20 space-y-4">
            <Card class="p-3">
              <SearchBar value={search()} onInput={handleSearch} placeholder="Buscar produtos..." />
            </Card>
            <CategoryFilter categories={categories} selected={category()} onSelect={handleCategory} />
            <TagFilter tags={popularTags} selected={tag()} onSelect={handleTag} />
          </div>
        </div>
        <div class="flex-1">
          <ProductGrid products={products()} isLoading={loading()} />
          {totalPages() > 1 && (
            <div class="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page() <= 1} class="eq-btn eq-btn-outline eq-btn-sm">
                Anterior
              </button>
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{page()} de {totalPages()}</span>
              <button onClick={() => setPage(p => Math.min(totalPages(), p + 1))} disabled={page() >= totalPages()} class="eq-btn eq-btn-outline eq-btn-sm">
                Próximo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
