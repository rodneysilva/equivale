import type { Component } from 'solid-js';
import { Heart } from 'lucide-solid';

const Footer: Component = () => {
  return (
    <footer class="glass-card rounded-none border-t border-b-0 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-xl font-bold gradient-text mb-3">equivale</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Troque talentos e produtos com moeda virtual. Uma nova forma de economia colaborativa.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Marketplace</h4>
            <ul class="space-y-2">
              <li><a href="/products" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Produtos</a></li>
              <li><a href="/services" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Serviços</a></li>
              <li><a href="/communities" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Comunidades</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Conta</h4>
            <ul class="space-y-2">
              <li><a href="/profile" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Perfil</a></li>
              <li><a href="/wallet" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Carteira</a></li>
              <li><a href="/login" class="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Entrar</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Sobre</h4>
            <ul class="space-y-2">
              <li><span class="text-sm text-gray-500 dark:text-gray-400">Termos de Uso</span></li>
              <li><span class="text-sm text-gray-500 dark:text-gray-400">Privacidade</span></li>
              <li><span class="text-sm text-gray-500 dark:text-gray-400">Ajuda</span></li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2025 equivale. Todos os direitos reservados.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Feito com <Heart size={14} class="text-red-500" /> no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
