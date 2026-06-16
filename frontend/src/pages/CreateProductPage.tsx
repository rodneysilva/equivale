import { type Component, Show, createEffect, createSignal, onMount } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { ArrowLeft, Package } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { CreateProductDto } from '../types';

const categories = ['Artesanato', 'Fotografia', 'Arte', 'Madeira', 'Alimentação', 'Jardinagem', 'Tecnologia', 'Bem-estar'];
const conditions: Array<'new' | 'used' | 'refurbished'> = ['new', 'used', 'refurbished'];

const CreateProductPage: Component = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const auth = useAuth();
  const toast = useToast();

  const editId = () => params.id;
  const isEdit = () => Boolean(editId());

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [category, setCategory] = createSignal(categories[0]);
  const [price, setPrice] = createSignal('');
  const [condition, setCondition] = createSignal<'new' | 'used' | 'refurbished'>('new');
  const [imageUrl, setImageUrl] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [loadingProduct, setLoadingProduct] = createSignal(false);
  const [error, setError] = createSignal('');
  const [communities, setCommunities] = createSignal<any[]>([]);
  const [communityId, setCommunityId] = createSignal('');
  const [tagsStr, setTagsStr] = createSignal('');
  const [stock, setStock] = createSignal(1);

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  });

  onMount(async () => {
    if (!auth.isAuthenticated()) return;
    try {
      const res = await communitiesService.getByMember(auth.currentUser()!.id);
      setCommunities(res);
    } catch {}

    // Modo edição: carrega o produto e preenche o formulário.
    if (editId()) {
      setLoadingProduct(true);
      try {
        const p = await productsService.getById(editId()!);
        setTitle(p.title ?? '');
        setDescription(p.description ?? '');
        setCategory(p.category ?? categories[0]);
        setPrice(String(p.price ?? ''));
        setCondition(p.condition ?? 'new');
        const imgs = p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : []);
        setImageUrl(imgs.join(','));
        setCommunityId(p.communityId ?? '');
        setTagsStr(p.tags?.join(', ') ?? '');
        setStock(p.stock ?? 1);
      } catch (err: any) {
        setError(err?.message || 'Não foi possível carregar o produto para edição.');
      } finally {
        setLoadingProduct(false);
      }
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const sellerId = auth.currentUser()?.id;
    if (!sellerId) {
      setError('Você precisa estar logado para publicar um produto.');
      return;
    }

    const parsedPrice = Number(price());
    if (!title().trim() || !description().trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Preencha os campos obrigatórios com um preço válido.');
      return;
    }

    const images = imageUrl().split(',').map(s => s.trim()).filter(Boolean);
    const tags = tagsStr().split(',').map(s => s.trim()).filter(Boolean);

    const payload: CreateProductDto = {
      title: title().trim(),
      description: description().trim(),
      category: category(),
      price: parsedPrice,
      imageUrl: imageUrl().trim() || undefined,
      images,
      condition: condition(),
      communityId: communityId() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      stock: stock(),
    };

    setLoading(true);
    try {
      if (isEdit()) {
        await productsService.update(editId()!, payload, sellerId);
        toast.success('Produto atualizado!');
        navigate(`/products/${editId()}`);
      } else {
        await productsService.create(payload, sellerId);
        toast.success('Produto publicado!');
        navigate('/products');
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Button variant="ghost" class="mb-4" onClick={() => navigate('/products')}>
        <ArrowLeft size={16} class="mr-2" />
        Voltar para produtos
      </Button>

      <Card class="p-6 sm:p-8">
        <div class="flex items-start gap-3 mb-6">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
            <Package size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 class="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>{isEdit() ? 'Editar produto' : 'Publicar produto'}</h1>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {isEdit() ? 'Atualize as informações do seu produto.' : 'Compartilhe algo que você quer trocar com a comunidade.'}
            </p>
          </div>
        </div>

        <Show when={loadingProduct()}>
          <LoadingSpinner class="py-12" />
        </Show>

        <Show when={!loadingProduct()}>
        <form onSubmit={handleSubmit} class="space-y-4">
          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              {error()}
            </div>
          )}

          <div class="grid md:grid-cols-2 gap-4">
            <Input
              label="Título"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="Ex.: Cadeira de madeira artesanal"
              required
            />

            <div class="w-full">
              <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Categoria</label>
              <select value={category()} onChange={(e) => setCategory(e.currentTarget.value)} class="eq-input">
                {categories.map((item) => (
                  <option value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div class="w-full">
            <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Descrição</label>
            <textarea
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              placeholder="Descreva o produto, seu estado e o que você espera em troca"
              rows={4}
              required
              class="eq-input resize-none"
            />
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <Input
              label="Preço em EQL"
              type="number"
              min="1"
              step="0.01"
              value={price()}
              onInput={(e) => setPrice(e.currentTarget.value)}
              placeholder="10"
              required
            />

            <div class="w-full">
              <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Condição</label>
              <select value={condition()} onChange={(e) => setCondition(e.currentTarget.value as 'new' | 'used' | 'refurbished')} class="eq-input">
                {conditions.map((item) => (
                  <option value={item}>{item === 'new' ? 'Novo' : item === 'used' ? 'Usado' : 'Recondicionado'}</option>
                ))}
              </select>
            </div>
          </div>

          <div class="w-full">
            <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Imagens</label>
            <ImageUpload onUpload={(urls) => setImageUrl(urls.join(','))} />
          </div>

          <div class="w-full">
            <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Comunidade</label>
            <select value={communityId()} onChange={(e) => setCommunityId(e.currentTarget.value)} class="eq-input">
              <option value="">Nenhuma</option>
              {communities().map((c) => (
                <option value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Tags (separadas por vírgula)"
            value={tagsStr()}
            onInput={(e) => setTagsStr(e.currentTarget.value)}
            placeholder="artesanal, madeira, sustentável"
          />

          <Input
            label="Estoque"
            type="number"
            min="1"
            value={stock()}
            onInput={(e) => setStock(Number(e.currentTarget.value))}
          />

          <div class="flex gap-2 pt-2">
            <Button type="submit" class="flex-1" disabled={loading()}>
              {loading() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : (isEdit() ? 'Salvar alterações' : 'Publicar produto')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/products')}>Cancelar</Button>
          </div>
        </form>
        </Show>
      </Card>
    </div>
  );
};

export default CreateProductPage;
