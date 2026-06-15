import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ShoppingCart, ArrowLeft, Tag, Users, Package } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { productsService } from '../services/products.service';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import type { Product } from '../types';

const ProductDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [product, setProduct] = createSignal<Product | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [buying, setBuying] = createSignal(false);
  const [quantity, setQuantity] = createSignal(1);
  const [showCheckout, setShowCheckout] = createSignal(false);
  const [deliveryAddress, setDeliveryAddress] = createSignal('');

  createEffect(() => { loadProduct(); });

  const loadProduct = async () => {
    setLoading(true);
    try { setProduct(await productsService.getById(params.id)); }
    catch { setError('Produto não encontrado'); }
    finally { setLoading(false); }
  };

  const handleBuy = async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    if (!deliveryAddress().trim()) { setError('Informe o endereço de entrega'); return; }
    setBuying(true);
    setError('');
    try {
      await transactionsService.create(params.id, 'Product', quantity(), deliveryAddress().trim());
      if (auth.refreshProfile) await auth.refreshProfile();
      setShowCheckout(false);
      navigate('/transactions');
    } catch (err: any) { setError(err.message || 'Erro ao comprar'); }
    finally { setBuying(false); }
  };

  const openCheckout = () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    setError('');
    setShowCheckout(true);
  };

  const itemTotal = () => (product()?.price ?? 0) * quantity();
  const shippingTotal = () => product()?.shippingCost ?? 0;
  const grandTotal = () => itemTotal() + shippingTotal();

  const isOwnProduct = () => auth.currentUser()?.id === product()?.sellerId;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} class="flex items-center gap-1.5 text-sm eq-link mb-6">
        <ArrowLeft size={14} /> Voltar
      </button>
      {loading() ? <LoadingSpinner class="py-20" /> : error() && !product() ? (
        <Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>{error()}</p></Card>
      ) : product() ? (
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card class="overflow-hidden">
            <div class="aspect-square flex items-center justify-center" style={{ background: 'var(--color-surface-alt)' }}>
              {product()!.imageUrl ? (
                <img src={product()!.imageUrl} alt={product()!.title} class="w-full h-full object-cover" />
              ) : (
                <Package size={48} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </div>
          </Card>
          <div class="space-y-5">
            <div>
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant={product()!.condition === 'new' ? 'info' : product()!.condition === 'used' ? 'warning' : 'success'}>
                  {product()!.condition === 'new' ? 'Novo' : product()!.condition === 'used' ? 'Usado' : 'Recondicionado'}
                </Badge>
                <Badge variant="primary"><Tag size={10} class="mr-1" />{product()!.category}</Badge>
                <Show when={product()!.stock !== undefined}>
                  <span class="text-xs" style={{ color: product()!.stock! > 0 ? 'var(--color-text-muted)' : '#dc2626' }}>
                    {product()!.stock! > 0 ? `${product()!.stock} em estoque` : 'Esgotado'}
                  </span>
                </Show>
              </div>
              <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{product()!.title}</h1>
              <p class="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{product()!.description}</p>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold eq-accent">{product()!.price}</span>
              <span class="text-base font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
            </div>
            <Show when={product()!.communityName}>
              <button onClick={() => product()!.communityId && navigate(`/communities/${product()!.communityId}`)} class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Users size={11} />{product()!.communityName}<span style={{ opacity: 0.6 }}>· ver comunidade</span>
              </button>
            </Show>
            <Show when={product()!.tags && product()!.tags!.length > 0}>
              <div class="flex flex-wrap gap-1.5">
                <For each={product()!.tags}>{(tag) => <span class="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>#{tag}</span>}</For>
              </div>
            </Show>
            <Show when={product()!.sellerName}>
              <Card class="p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/users/${product()!.sellerId}`)}>
                <div class="flex items-center gap-3">
                  <Avatar name={product()!.sellerName!} size="md" />
                  <div><p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{product()!.sellerName}</p><p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vendedor</p></div>
                </div>
              </Card>
            </Show>

            {/* Buy section */}
            <Show when={!isOwnProduct()}>
              <Show when={product()!.stock === undefined || product()!.stock! > 0}>
                <Button size="lg" class="w-full" onClick={openCheckout}>
                  <ShoppingCart size={16} class="mr-2" /> Comprar
                </Button>
              </Show>
            </Show>
            <Show when={isOwnProduct()}>
              <Card class="p-3 text-center"><p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Este é o seu produto</p></Card>
            </Show>

            {error() && <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>}
            <Card class="p-3"><div class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Criado em {formatDate(product()!.createdAt)}</div></Card>
          </div>
        </div>
      ) : null}

      {/* Checkout modal */}
      <Show when={showCheckout() && product()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCheckout(false)}>
          <div class="eq-card p-6 max-w-md w-full" style={{ 'box-shadow': 'var(--shadow-md)' }} onClick={(e) => e.stopPropagation()}>
            <h2 class="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Finalizar compra</h2>

            {/* Resumo */}
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm"><span style={{ color: 'var(--color-text-muted)' }}>Produto</span><span style={{ color: 'var(--color-text)' }}>{product()!.title}</span></div>
              <div class="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Quantidade</span>
                <div class="flex items-center gap-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} class="eq-btn-outline eq-btn-sm w-7 h-7 rounded text-sm">-</button>
                  <span class="text-sm font-medium w-6 text-center" style={{ color: 'var(--color-text)' }}>{quantity()}</span>
                  <button onClick={() => setQuantity(q => Math.min(product()!.stock ?? 99, q + 1))} class="eq-btn-outline eq-btn-sm w-7 h-7 rounded text-sm">+</button>
                </div>
              </div>
              <div class="flex justify-between text-sm"><span style={{ color: 'var(--color-text-muted)' }}>Preço unitário</span><span style={{ color: 'var(--color-text)' }}>{product()!.price} EQL</span></div>
              <div class="flex justify-between text-sm"><span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span><span style={{ color: 'var(--color-text)' }}>{itemTotal()} EQL</span></div>
              <Show when={shippingTotal() > 0}>
                <div class="flex justify-between text-sm"><span style={{ color: 'var(--color-text-muted)' }}>Frete</span><span style={{ color: 'var(--color-text)' }}>{shippingTotal()} EQL</span></div>
              </Show>
              <div class="flex justify-between font-bold pt-2" style={{ 'border-top': '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text)' }}>Total</span>
                <span class="eq-accent text-lg">{grandTotal()} EQL</span>
              </div>
            </div>

            {/* Endereço */}
            <div class="mb-4">
              <label class="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Endereço de entrega</label>
              <textarea value={deliveryAddress()} onInput={(e) => setDeliveryAddress(e.currentTarget.value)} rows={3} placeholder="Rua, número, bairro, cidade, CEP..." class="eq-input resize-none" />
              <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Este endereço será compartilhado com o vendedor após a confirmação do pedido.</p>
            </div>

            {error() && <div class="p-2.5 rounded text-xs mb-3" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>}

            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" onClick={() => setShowCheckout(false)}>Cancelar</Button>
              <Button class="flex-1" onClick={handleBuy} disabled={buying()}>
                {buying() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Confirmar compra'}
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default ProductDetailPage;
