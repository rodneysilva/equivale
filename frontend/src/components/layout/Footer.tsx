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
              <li><a href="/profile" class="text-xs eq-link">Perfil</a></li>
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
            © 2025 eqüivale. Todos os direitos reservados.
          </p>
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Feito no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
