import { type Component, createEffect, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { servicesService } from '../services/services.service';
import { useAuth } from '../store/auth';
import type { CreateServiceDto } from '../types';

const categories = ['Design', 'Programação', 'Marketing', 'Escrita', 'Consultoria', 'Aulas', 'Fotografia', 'Outros'];

const CreateServicePage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [category, setCategory] = createSignal(categories[0]);
  const [price, setPrice] = createSignal('');
  const [duration, setDuration] = createSignal('');
  const [location, setLocation] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const providerId = auth.currentUser()?.id;
    if (!providerId) {
      setError('Você precisa estar logado para oferecer um serviço.');
      return;
    }

    const parsedPrice = Number(price());
    if (!title().trim() || !description().trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Preencha os campos obrigatórios com um preço válido.');
      return;
    }

    const payload: CreateServiceDto = {
      title: title().trim(),
      description: description().trim(),
      category: category(),
      price: parsedPrice,
      imageUrl: imageUrl().trim() || undefined,
      duration: duration().trim() || undefined,
      location: location().trim() || undefined,
    };

    setLoading(true);
    try {
      await servicesService.create(payload, providerId);
      navigate('/services');
    } catch (err: any) {
      setError(err.message || 'Não foi possível publicar o serviço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Button variant="ghost" class="mb-4" onClick={() => navigate('/services')}>
        <ArrowLeft size={16} class="mr-2" />
        Voltar para serviços
      </Button>

      <Card class="p-6 sm:p-8">
        <div class="flex items-start gap-3 mb-6">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
            <BriefcaseBusiness size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 class="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Oferecer serviço</h1>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Mostre o que você faz e comece a receber EQL por isso.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          {error() && (
            <div class="p-3 rounded text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
              {error()}
            </div>
          )}

          <div class="grid md:grid-cols-2 gap-4">
            <Input
              label="Título"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="Ex.: Design de identidade visual"
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
              placeholder="Descreva o serviço, o que inclui e como funciona"
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
              placeholder="20"
              required
            />

            <Input
              label="Duração (opcional)"
              value={duration()}
              onInput={(e) => setDuration(e.currentTarget.value)}
              placeholder="2 horas"
            />
          </div>

          <Input
            label="Localização (opcional)"
            value={location()}
            onInput={(e) => setLocation(e.currentTarget.value)}
            placeholder="Remoto ou cidade"
          />

          <Input
            label="URL da imagem (opcional)"
            value={imageUrl()}
            onInput={(e) => setImageUrl(e.currentTarget.value)}
            placeholder="https://..."
          />

          <div class="flex gap-2 pt-2">
            <Button type="submit" class="flex-1" disabled={loading()}>
              {loading() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Publicar serviço'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/services')}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateServicePage;
