import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ShoppingCart, ArrowLeft, Tag, Users, Package, PenLine, Trash2 } from 'lucide-solid';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { productsService } from '../services/products.service';
import { transactionsService } from '../services/transactions.service';
import { api } from '../services/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { Product, Review } from '../types';

const ProductDetailPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const [product, setProduct] = createSignal<Product | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [buying, setBuying] = createSignal(false);
  const [quantity, setQuantity] = createSignal(1);
  const [showCheckout, setShowCheckout] = createSignal(false);
  const [deliveryAddress, setDeliveryAddress] = createSignal('');
  const [reviews, setReviews] = createSignal<Review[]>([]);
  const [sellerProductCount, setSellerProductCount] = createSignal(0);
  const [selectedImage, setSelectedImage] = createSignal('');
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  createEffect(() => {
    loadProduct();
    loadReviews();
  });

  const loadProduct = async () => {
    setLoading(true);
    try {
      const p = await productsService.getById(params.id);
      setProduct(p);
      setSelectedImage(p.imageUrl || '');
      loadSellerInfo(p.sellerId);
    }
    catch { setError('Produto não encontrado'); }
    finally { setLoading(false); }
  };

  const loadReviews = async () => {
    try {
      const data = await api.get<Review[]>(`/reviews?itemId=${params.id}&itemType=Product`);
      setReviews(data);
    } catch { /* silently fail */ }
  };

  const loadSellerInfo = async (sellerId?: string) => {
    try {
      const id = sellerId || product()?.sellerId;
      if (id) {
        const sellerProducts = await productsService.getBySeller(id);
        setSellerProductCount(sellerProducts.length);
      }
    } catch { /* silently fail */ }
  };

  const handleBuy = async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    if (!deliveryAddress().trim()) { setError('Informe o endereço de entrega'); return; }
    setBuying(true);
    setError('');
    try {
      await transactionsService.create(params.id, 'Product', quantity(), deliveryAddress().trim());
      toast.success('Pedido criado!');
      if (auth.refreshProfile) await auth.refreshProfile();
      setShowCheckout(false);
      navigate('/transactions');
    } catch (err: any) { toast.error(err.message || 'Erro ao comprar'); }
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

  const handleDelete = async () => {
    try {
      await productsService.delete(params.id);
      toast.success('Produto excluído.');
      navigate('/products');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir produto');
    }
  };

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
              {selectedImage() ? (
                <img src={selectedImage()} alt={product()!.title} class="w-full h-full object-cover" />
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
              <Show when={product()!.images && product()!.images!.length > 1}>
                <div class="flex gap-2 overflow-x-auto pb-1 mt-3">
                  <For each={product()!.images!}>
                    {(img) => (
                      <button onClick={() => setSelectedImage(img)} class="flex-shrink-0">
                        <img src={img} alt="" class="w-16 h-16 rounded object-cover border-2 transition-colors" style={{ 'border-color': selectedImage() === img ? 'var(--color-primary)' : 'var(--color-border)' }} />
                      </button>
                    )}
                  </For>
                </div>
              </Show>
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
            <Show when={reviews().length > 0}>
              <Card class="p-4">
                <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Avaliações ({reviews().length})</h3>
                <div class="space-y-3">
                  <For each={reviews()}>
                    {(review) => (
                      <div class="pb-3" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
                        <div class="flex items-center gap-2 mb-1">
                          {review.reviewerName ? (
                            <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{review.reviewerName}</span>
                          ) : (
                            <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Anônimo</span>
                          )}
                          <StarRating rating={review.rating} size={10} />
                        </div>
                        {review.comment && <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{review.comment}</p>}
                        <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </For>
                </div>
              </Card>
            </Show>
            <Show when={product()!.sellerName}>
              <Card class="p-4">
                <div class="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/users/${product()!.sellerId}`)}>
                  <Avatar name={product()!.sellerName!} size="md" />
                  <div class="flex-1">
                    <p class="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{product()!.sellerName}</p>
                    <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vendedor{sellerProductCount() > 0 ? ` · ${sellerProductCount()} produto${sellerProductCount() !== 1 ? 's' : ''}` : ''}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" class="w-full" onClick={() => navigate(`/users/${product()!.sellerId}`)}>
                  Ver perfil
                </Button>
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
              <Card class="p-4">
                <p class="text-sm text-center mb-3" style={{ color: 'var(--color-text-muted)' }}>Este é o seu produto</p>
                <div class="flex gap-2">
                  <Button variant="outline" class="flex-1" onClick={() => navigate(`/products/${product()!.id}/edit`)}>
                    <PenLine size={14} class="mr-2" /> Editar
                  </Button>
                  <Button variant="outline" class="flex-1" onClick={() => setShowDeleteConfirm(true)} style={{ color: '#dc2626', 'border-color': '#dc2626' }}>
                    <Trash2 size={14} class="mr-2" /> Excluir
                  </Button>
                </div>
              </Card>
            </Show>

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

            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" onClick={() => setShowCheckout(false)}>Cancelar</Button>
              <Button class="flex-1" onClick={handleBuy} disabled={buying()}>
                {buying() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Confirmar compra'}
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Delete confirmation modal */}
      <Modal open={showDeleteConfirm()} onClose={() => setShowDeleteConfirm(false)} title="Excluir produto" size="sm">
        <p class="text-sm eq-text-secondary mb-4">Tem certeza que deseja excluir "{product()?.title}"? Esta ação não pode ser desfeita.</p>
        <div class="flex gap-2">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button onClick={handleDelete} style={{ background: '#dc2626' }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
