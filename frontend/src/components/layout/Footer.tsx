import type { Component } from 'solid-js';

const Footer: Component = () => {
  return (
    <footer class="eq-divider mt-16" style={{ background: 'var(--color-surface)' }}>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 class="text-base font-bold eq-brand mb-2">eqüivale</h3>
            <p class="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Economia colaborativa por meio de comunidades. Troque talentos e produtos com moeda virtual.
            </p>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Marketplace</h4>
            <ul class="space-y-1.5">
              <li><a href="/products" class="text-xs eq-link">Produtos</a></li>
              <li><a href="/services" class="text-xs eq-link">Serviços</a></li>
              <li><a href="/communities" class="text-xs eq-link">Comunidades</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Conta</h4>
            <ul class="space-y-1.5">
              <li><a href="/dashboard" class="text-xs eq-link">Painel</a></li>
              <li><a href="/wallet" class="text-xs eq-link">Carteira</a></li>
              <li><a href="/login" class="text-xs eq-link">Entrar</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Legal</h4>
            <ul class="space-y-1.5">
              <li><span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Termos de Uso</span></li>
              <li><span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Privacidade</span></li>
              <li><span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Suporte</span></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-4 eq-divider flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            © 2026 eqüivale. Todos os direitos reservados.
          </p>
          <p class="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--color-primary)' }}>
              <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.67C12.79 6.7 13.12 4.22 14.94 2c-1.68.53-3.21 1.57-4.34 2.97-1.22 1.53-1.96 3.5-1.94 5.48.01.32.03.64.08.95.04.26.07.39.07.59 0 .83-.68 1.5-1.5 1.5-.41 0-.79-.17-1.07-.44-.27-.27-.43-.65-.43-1.06 0-1.06.66-1.96.66-1.96s-2.55 1.06-2.55 3.96c0 2.48 1.93 4.51 4.41 4.51.1 0 .2-.01.3-.01-.2.55-.31 1.14-.31 1.76 0 .55.09 1.07.25 1.56.34-.26.76-.42 1.22-.42.83 0 1.5.67 1.5 1.5 0 .3-.09.58-.24.81.43.06.87.1 1.31.1 3.59 0 6.5-2.91 6.5-6.5 0-1.79-.73-3.42-1.9-4.6z"/>
            </svg>
            Feito pra comunidade
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
