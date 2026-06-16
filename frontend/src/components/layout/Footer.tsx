import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const Footer: Component = () => {
  const navigate = useNavigate();
  const linkClass = 'text-xs eq-link cursor-pointer';

  return (
    <footer class="eq-divider mt-16" style={{ background: 'var(--color-surface)' }}>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 class="text-base font-bold eq-brand mb-2 flex items-center gap-1.5">
              <img src="/favicon.svg" alt="" class="w-5 h-5" />
              eqüivale
            </h3>
            <p class="text-xs leading-relaxed eq-text-muted">
              Economia colaborativa por meio de comunidades. Troque talentos e produtos com moeda virtual.
            </p>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 eq-text-secondary">Marketplace</h4>
            <ul class="space-y-1.5">
              <li><button onClick={() => navigate('/products')} class={linkClass}>Produtos</button></li>
              <li><button onClick={() => navigate('/services')} class={linkClass}>Serviços</button></li>
              <li><button onClick={() => navigate('/communities')} class={linkClass}>Comunidades</button></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 eq-text-secondary">Conta</h4>
            <ul class="space-y-1.5">
              <li><button onClick={() => navigate('/dashboard')} class={linkClass}>Painel</button></li>
              <li><button onClick={() => navigate('/wallet')} class={linkClass}>Carteira</button></li>
              <li><button onClick={() => navigate('/login')} class={linkClass}>Entrar</button></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 eq-text-secondary">Legal</h4>
            <ul class="space-y-1.5">
              <li><span class="text-xs eq-text-muted">Termos de Uso</span></li>
              <li><span class="text-xs eq-text-muted">Privacidade</span></li>
              <li><span class="text-xs eq-text-muted">Suporte</span></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-4 eq-divider flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs eq-text-muted">
            © 2026 eqüivale. Todos os direitos reservados.
          </p>
          <p class="text-xs flex items-center gap-1.5 eq-text-muted">
            <img src="/favicon.svg" alt="" class="w-4 h-4" />
            <span class="eq-brand font-bold">eqüivale</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
