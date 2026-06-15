import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowRight } from 'lucide-solid';
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
        productsService.getAll(1, 8),
        servicesService.getAll(1, 6),
        communitiesService.getAll(1, 6),
      ]);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
      setCommunities(communitiesRes.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Comunidades */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div class="flex items-center justify-between mb-6">
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

      {/* Produtos */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Produtos</h2>
            <p class="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Itens disponíveis nas comunidades</p>
          </div>
          <button onClick={() => navigate('/products')} class="flex items-center gap-1 text-sm eq-link">
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {loading() ? <LoadingSpinner class="py-12" /> : <ProductGrid products={products()} />}
      </section>

      {/* Serviços */}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex items-center justify-between mb-6">
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
    </div>
  );
};

export default HomePage;
