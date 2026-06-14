import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowRight, Package, Zap, Users, TrendingUp, ShoppingBag, Briefcase, Globe } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import CommunityCard from '../components/community/CommunityCard';
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
        communitiesService.getAll(1, 4),
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

  const stats = [
    { label: 'Produtos', value: '2.5k+', icon: Package },
    { label: 'Serviços', value: '1.2k+', icon: Zap },
    { label: 'Comunidades', value: '350+', icon: Globe },
    { label: 'Transações', value: '15k+', icon: TrendingUp },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div class="absolute bottom-10 right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ 'animation-delay': '1s' }} />
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div class="text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Troque talentos e produtos
              <br />
              <span class="text-indigo-200">com moeda virtual</span>
            </h1>
            <p class="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              O marketplace colaborativo onde sua moeda é seu talento. Compre, venda e troque usando EQL.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LiquidButton size="lg" onClick={() => navigate('/products')}>
                <ShoppingBag size={20} class="mr-2" />
                Explorar Marketplace
              </LiquidButton>
              <LiquidButton variant="outline" size="lg" class="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20" onClick={() => navigate('/register')}>
                Criar Conta Grátis
              </LiquidButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <GlassCard class="p-4 text-center">
              <stat.icon size={24} class="mx-auto text-indigo-500 mb-2" />
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Produtos em Destaque</h2>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Descubra itens incríveis na comunidade</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        {loading() ? <LoadingSpinner class="py-12" /> : <ProductGrid products={products()} />}
      </section>

      {/* Featured Services */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Serviços em Destaque</h2>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Talentos e habilidades à sua disposição</p>
          </div>
          <button
            onClick={() => navigate('/services')}
            class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        {loading() ? <LoadingSpinner class="py-12" /> : <ServiceGrid services={services()} />}
      </section>

      {/* Featured Communities */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Comunidades Ativas</h2>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Conecte-se com pessoas que compartilham seus interesses</p>
          </div>
          <button
            onClick={() => navigate('/communities')}
            class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline"
          >
            Ver todas <ArrowRight size={16} />
          </button>
        </div>
        {loading() ? (
          <LoadingSpinner class="py-12" />
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {communities().map(c => <CommunityCard community={c} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GlassCard class="p-8 sm:p-12 text-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <Briefcase size={40} class="mx-auto text-indigo-500 mb-4" />
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tem um talento ou produto para oferecer?
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a vender seus produtos e serviços usando moeda virtual.
          </p>
          <LiquidButton size="lg" onClick={() => navigate('/register')}>
            Começar Agora
            <ArrowRight size={20} class="ml-2" />
          </LiquidButton>
        </GlassCard>
      </section>
    </div>
  );
};

export default HomePage;
