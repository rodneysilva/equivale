import { type Component, createSignal, createEffect } from 'solid-js';
import { productsService } from '../services/products.service';
import ProductGrid from '../components/marketplace/ProductGrid';
import SearchBar from '../components/marketplace/SearchBar';
import CategoryFilter from '../components/marketplace/CategoryFilter';
import GlassCard from '../components/ui/GlassCard';
import type { Product } from '../types';

const categories = ['Eletrônicos', 'Roupas', 'Livros', 'Casa & Jardim', 'Esportes', 'Arte', 'Música', 'Outros'];

const ProductsPage: Component = () => {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);

  createEffect(() => {
    loadProducts();
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll(page(), 12, category() || undefined, search() || undefined);
      setProducts(res.data);
      setTotalPages(res.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Produtos</h1>
        <p class="text-gray-500 dark:text-gray-400">Explore produtos disponíveis na comunidade</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <div class="lg:w-64 shrink-0">
          <div class="lg:sticky lg:top-24 space-y-4">
            <GlassCard class="p-4">
              <SearchBar value={search()} onInput={handleSearch} placeholder="Buscar produtos..." />
            </GlassCard>
            <CategoryFilter
              categories={categories}
              selected={category()}
              onSelect={handleCategory}
            />
          </div>
        </div>

        {/* Products grid */}
        <div class="flex-1">
          <ProductGrid products={products()} isLoading={loading()} />

          {/* Pagination */}
          {totalPages() > 1 && (
            <div class="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page() <= 1}
                class="px-4 py-2 rounded-xl text-sm font-medium glass-card disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Anterior
              </button>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {page()} de {totalPages()}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages(), p + 1))}
                disabled={page() >= totalPages()}
                class="px-4 py-2 rounded-xl text-sm font-medium glass-card disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
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
