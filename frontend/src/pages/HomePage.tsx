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
        productsService.getAll(1, 10),
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

  const sectionHeader = (title: string, subtitle: string, link: string) => (
    <div class="flex items-end justify-between mb-5">
      <div>
        <h2 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        <p class="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
      </div>
      <button onClick={() => navigate(link)} class="flex items-center gap-1 text-sm eq-link shrink-0">
        Ver todos <ArrowRight size={14} />
      </button>
    </div>
  );

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Comunidades */}
      <section>
        {sectionHeader('Comunidades em destaque', 'Encontre seu grupo', '/communities')}
        {loading() ? <LoadingSpinner class="py-8" /> : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities().map(c => <CommunityCard community={c} />)}
          </div>
        )}
      </section>

      {/* Produtos */}
      <section>
        {sectionHeader('Produtos', 'Itens disponíveis', '/products')}
        {loading() ? <LoadingSpinner class="py-8" /> : <ProductGrid products={products()} />}
      </section>

      {/* Serviços */}
      <section>
        {sectionHeader('Serviços', 'Talentos disponíveis', '/services')}
        {loading() ? <LoadingSpinner class="py-8" /> : <ServiceGrid services={services()} />}
      </section>
    </div>
  );
};

export default HomePage;
