import { type Component, createSignal, onMount, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowRight, Sparkles } from 'lucide-solid';
import CommunityCard from '../components/community/CommunityCard';
import ProductGrid from '../components/marketplace/ProductGrid';
import ServiceGrid from '../components/marketplace/ServiceGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { communitiesService } from '../services/communities.service';
import { adminService } from '../services/admin.service';
import type { Product, Service, Community } from '../types';

interface HeroStats {
  communities: number | null;
  products: number | null;
  eqlVolume: number | null;
}

const HomePage: Component = () => {
  const navigate = useNavigate();

  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [communities, setCommunities] = createSignal<Community[]>([]);
  const [loading, setLoading] = createSignal(true);

  const [stats, setStats] = createSignal<HeroStats>({
    communities: null,
    products: null,
    eqlVolume: null,
  });

  onMount(() => { loadFeatured(); loadHeroStats(); });

  const loadFeatured = async () => {
    try {
      const [productsRes, servicesRes, communitiesRes] = await Promise.all([
        productsService.getAll(1, 12),
        servicesService.getAll(1, 12),
        communitiesService.getAll(1, 6),
      ]);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
      setCommunities(communitiesRes.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const loadHeroStats = async () => {
    const result: HeroStats = { communities: null, products: null, eqlVolume: null };
    try {
      const commRes = await communitiesService.getAll(1, 1);
      result.communities = commRes.total;
    } catch { /* keep null */ }
    try {
      const prodRes = await productsService.getAll(1, 1);
      result.products = prodRes.total;
    } catch { /* keep null */ }
    try {
      const adminStats = await adminService.getStats();
      result.eqlVolume = adminStats.totalVolume ?? null;
    } catch { /* não-logados não têm acesso — deixa null (fallback "--") */ }
    setStats(result);
  };

  const formatStat = (value: number | null): string => {
    if (value === null) return '--';
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    return String(value);
  };

  const sectionHeader = (title: string, subtitle: string, link: string) => (
    <div class="flex items-end justify-between mb-4">
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
    <div class="w-full">
      {/* ====================== HERO EMOCIONAL ====================== */}
      <section class="eq-hero">
        {/* Formas orgânicas de fundo */}
        <div class="eq-hero-blob eq-hero-blob--comm" aria-hidden="true" />
        <div class="eq-hero-blob eq-hero-blob--gold" aria-hidden="true" />
        <div class="eq-hero-blob eq-hero-blob--terr" aria-hidden="true" />

        {/* Anéis concêntricos — circularidade / troca */}
        <div class="eq-hero-ring" aria-hidden="true"
          style={{ width: '34rem', height: '34rem', top: '-10rem', right: '-8rem' }} />
        <div class="eq-hero-ring" aria-hidden="true"
          style={{ width: '22rem', height: '22rem', bottom: '-6rem', left: '-4rem', "border-color": 'color-mix(in srgb, var(--color-accent) 22%, transparent)' }} />

        {/* Símbolo de troca circular — SVG inline */}
        <svg class="eq-hero-symbol" aria-hidden="true" viewBox="0 0 100 100"
          style={{ width: '14rem', height: '14rem', bottom: '2rem', right: '6%' }}>
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M30 50 a20 20 0 0 1 40 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path d="M70 50 a20 20 0 0 1 -40 0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5" transform="rotate(180 50 50)" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div class="max-w-3xl">
            <span class="eq-badge eq-badge-primary mb-4 inline-flex items-center gap-1.5">
              <Sparkles size={12} />
              Economia solidária, entre gente de verdade
            </span>

            <h1 class="eq-display font-bold leading-[1.05] tracking-tight"
              style={{ color: 'var(--color-text)', "font-size": 'clamp(2rem, 6vw, 3.75rem)' }}>
              A economia que{' '}
              <span style={{ color: 'var(--color-primary)' }}>gira</span>{' '}
              entre{' '}
              <span style={{ color: 'var(--color-terracota)' }}>pessoas</span>.
            </h1>

            <p class="mt-5 eq-prose text-base sm:text-lg max-w-2xl"
              style={{ color: 'var(--color-text-secondary)' }}>
              No eqüivale, valor não fica parado. Ele circula em forma de produtos, talentos e
              tempo — mediado pelo <strong style={{ color: 'var(--color-accent)' }}>EQL</strong>,
              a moeda das nossas comunidades. Troque com quem você conhece, confia e ama ver crescer.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/products')}
                class="eq-btn eq-btn-lg eq-btn-community inline-flex items-center gap-2"
              >
                Começar a trocar
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/communities')}
                class="eq-btn eq-btn-lg eq-btn-outline"
              >
                Explorar comunidades
              </button>
            </div>

            {/* Prova social */}
            <div class="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              <HeroStat label="Comunidades ativas" value={formatStat(stats().communities)} accent="var(--color-community)" />
              <HeroStat label="Em circulação" value={formatStat(stats().products)} accent="var(--color-product)" suffix="itens" />
              <HeroStat label="EQL transacionados" value={formatStat(stats().eqlVolume)} accent="var(--color-service)" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================== CONTEÚDO EXISTENTE ====================== */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Comunidades */}
        <section>
          {sectionHeader('Comunidades em destaque', 'Encontre seu grupo', '/communities')}
          {loading() ? <LoadingSpinner class="py-8" /> : (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={communities()}>{(c) => <CommunityCard community={c} />}</For>
            </div>
          )}
        </section>

        {/* Produtos recentes */}
        <section>
          {sectionHeader('Produtos recentes', 'Últimos adicionados', '/products')}
          {loading() ? <LoadingSpinner class="py-8" /> : <ProductGrid products={products()} />}
        </section>

        {/* Serviços recentes */}
        <section>
          {sectionHeader('Serviços recentes', 'Talentos disponíveis', '/services')}
          {loading() ? <LoadingSpinner class="py-8" /> : <ServiceGrid services={services()} />}
        </section>
      </div>
    </div>
  );
};

const HeroStat: Component<{ label: string; value: string; accent: string; suffix?: string }> = (props) => (
  <div>
    <div class="eq-display text-2xl sm:text-3xl font-bold leading-none" style={{ color: props.accent }}>
      {props.value}
      {props.suffix && (
        <span class="text-xs sm:text-sm font-medium ml-1" style={{ color: 'var(--color-text-muted)' }}>
          {props.suffix}
        </span>
      )}
    </div>
    <div class="mt-1.5 text-xs sm:text-sm leading-tight" style={{ color: 'var(--color-text-muted)' }}>
      {props.label}
    </div>
  </div>
);

export default HomePage;
