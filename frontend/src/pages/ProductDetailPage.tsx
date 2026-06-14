import { type Component, createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ShoppingCart, ArrowLeft, Star, Tag, User } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { productsService } from '../services/products.service';
import { useAuth } from '../store/auth';
import type { Product } from '../types';

const ProductDetailPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [product, setProduct] = createSignal<Product | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [buying, setBuying] = createSignal(false);

  createEffect(() => {
    loadProduct();
  });

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productsService.getById(params.id);
      setProduct(data);
    } catch {
      setError('Produto não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      await productsService.buy(params.id);
      navigate('/wallet');
    } catch (err: any) {
      setError(err.message || 'Erro ao comprar');
    } finally {
      setBuying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : error() ? (
        <GlassCard class="p-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">{error()}</p>
        </GlassCard>
      ) : product() ? (
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product image */}
          <GlassCard class="overflow-hidden">
            <div class="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              {product()!.imageUrl ? (
                <img src={product()!.imageUrl} alt={product()!.title} class="w-full h-full object-cover" />
              ) : (
                <svg class="w-24 h-24 text-indigo-300 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
            </div>
          </GlassCard>

          {/* Product details */}
          <div class="space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Badge variant={product()!.condition === 'new' ? 'info' : product()!.condition === 'used' ? 'warning' : 'success'}>
                  {product()!.condition === 'new' ? 'Novo' : product()!.condition === 'used' ? 'Usado' : 'Recondicionado'}
                </Badge>
                <Badge variant="primary">
                  <Tag size={12} class="mr-1" />
                  {product()!.category}
                </Badge>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{product()!.title}</h1>
              <p class="text-gray-500 dark:text-gray-400 mt-2">{product()!.description}</p>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold gradient-text">{product()!.price}</span>
              <span class="text-xl text-gray-500 dark:text-gray-400 font-medium">EQL</span>
            </div>

            {product()!.sellerName && (
              <GlassCard class="p-4">
                <div class="flex items-center gap-3">
                  <Avatar name={product()!.sellerName} size="md" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{product()!.sellerName}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Vendedor</p>
                  </div>
                </div>
              </GlassCard>
            )}

            <div class="flex gap-3">
              <LiquidButton
                size="lg"
                class="flex-1"
                onClick={handleBuy}
                disabled={buying() || product()!.status !== 'available'}
              >
                {buying() ? (
                  <LoadingSpinner size="w-5 h-5" class="!justify-start" />
                ) : product()!.status === 'available' ? (
                  <>
                    <ShoppingCart size={20} class="mr-2" />
                    Comprar
                  </>
                ) : (
                  'Indisponível'
                )}
              </LiquidButton>
            </div>

            {error() && (
              <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error()}
              </div>
            )}

            <GlassCard class="p-4">
              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Criado em {formatDate(product()!.createdAt)}</span>
                {product()!.updatedAt !== product()!.createdAt && (
                  <span>· Atualizado em {formatDate(product()!.updatedAt)}</span>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailPage;
