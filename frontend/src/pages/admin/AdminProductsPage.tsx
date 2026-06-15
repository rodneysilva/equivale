import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, Trash2 } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminService } from '../../services/admin.service';
import type { Product } from '../../types';

const AdminProductsPage: Component = () => {
  const navigate = useNavigate();
  const [products, setProducts] = createSignal<Product[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await adminService.getAllProducts(1, 100);
      setProducts(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const remove = async (id: string) => {
    try {
      await adminService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>
      <h1 class="text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Produtos ({products().length})</h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="space-y-2">
          <For each={products()}>
            {(product) => (
              <Card class="p-3 flex items-center gap-3">
                <div class="w-12 h-12 rounded overflow-hidden shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
                  {product.imageUrl && <img src={product.imageUrl} alt={product.title} class="w-full h-full object-cover" />}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{product.title}</p>
                  <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{product.category} · {product.price} EQL · Stock: {product.stock ?? 1}</p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => remove(product.id)} style={{ color: '#dc2626' }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            )}
          </For>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
