import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowRight, Users, Package, Zap, Globe, Lock, Eye, EyeOff } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommunityCard from '../components/community/CommunityCard';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { communitiesService } from '../services/communities.service';
import type { Product, Service, Community } from '../types';

const HomePage: Component = () => {
  const navigate = useNavigate();

  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    loadFeatured();
  });

  const loadFeatured = async () => {
    try {
      const [productsRes, servicesRes, communitiesRes] = await Promise.all([
        productsService.getAll(1, 4),
        servicesService.getAll(1, 4),
        communitiesService.getAll(1, 6),
      ]);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
      setCommunities(communitiesRes.data);
    } catch {
      // silently fail for demo
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero — sóbrio, direto */}
      <section class="border-b" style={{ background: 'var(--color-surface)', 'border-color': 'var(--color-border)' }}>
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div class="max-w-2xl">
            <h1 class="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Construa sua comunidade.
              <br />
              <span class="eq-brand">Troque com quem confia.</span>
            </h1>
            <p class="mt-4 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              No equivale, comunidades são o centro de tudo. Crie ou entre em uma comunidade, compartilhe produtos e serviços, e use EQL — a moeda que conecta pessoas.
            </p>
            <div class="flex flex-wrap items-center gap-3 mt-8">
              <Button size="lg" onClick={() => navigate('/communities')}>
                Explorar comunidades
                <ArrowRight size={16} class="ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/register')}>
                Criar conta
              </Button>
            </div>
          </div>

          {/* Stats — minimal */}
          <div class="grid grid-cols-3 gap-4 mt-16 max-w-lg">
            <div>
              <p class="text-2xl font-bold eq-brand">350+</p>
              <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Comunidades</p>
            </div>
            <div>
              <p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>2.5k+</p>
              <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Produtos</p>
            </div>
            <div>
              <p class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>15k+</p>
              <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Transações</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comunidades — SEÇÃO PRINCIPAL */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Comunidades</h2>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Encontre seu grupo e comece a trocar</p>
          </div>
          <button onClick={() => navigate('/communities')} class="flex items-center gap-1 text-sm eq-link">
            Ver todas <ArrowRight size={14} />
          </button>
        </div>
        {loading() ? (
          <LoadingSpinner class="py-12" />
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities().map(c => <CommunityCard community={c} />)}
          </div>
        )}
      </section>

      {/* Como funciona */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 class="text-xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>Como funciona</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card class="p-6">
            <div class="eq-avatar w-10 h-10 text-sm mb-3">
              <Users size={18} />
            </div>
            <h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Crie ou entre em uma comunidade</h3>
            <p class="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Comunidades abertas ou por convite. Cada uma com seus próprios moderadores e regras de visibilidade.
            </p>
          </Card>
          <Card class="p-6">
            <div class="eq-avatar w-10 h-10 text-sm mb-3">
              <Package size={18} />
            </div>
            <h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Compartilhe produtos e serviços</h3>
            <p class="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Publique dentro da sua comunidade. O dono decide se os itens ficam visíveis para não-membros.
            </p>
          </Card>
          <Card class="p-6">
            <div class="eq-avatar w-10 h-10 text-sm mb-3">
              <Zap size={18} />
            </div>
            <h3 class="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Troque com EQL</h3>
            <p class="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              A moeda virtual do marketplace. Compre, venda e transfira dentro da plataforma.
            </p>
          </Card>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Produtos</h2>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Itens recentes nas comunidades</p>
          </div>
          <button onClick={() => navigate('/products')} class="flex items-center gap-1 text-sm eq-link">
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {loading() ? <LoadingSpinner class="py-12" /> : <ProductGrid products={products()} />}
      </section>

      {/* Serviços em destaque */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Serviços</h2>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Talentos disponíveis</p>
          </div>
          <button onClick={() => navigate('/services')} class="flex items-center gap-1 text-sm eq-link">
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {loading() ? <LoadingSpinner class="py-12" /> : <ServiceGrid services={services()} />}
      </section>

      {/* CTA final */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <Card class="p-8 sm:p-12 text-center" style={{ background: 'var(--color-surface)' }}>
          <h2 class="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Pronto para começar?
          </h2>
          <p class="mt-3 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Cadastre-se gratuitamente, crie sua comunidade ou entre em uma existente.
          </p>
          <div class="mt-6">
            <Button size="lg" onClick={() => navigate('/register')}>
              Criar conta gratuita
              <ArrowRight size={16} class="ml-2" />
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
