import type { Component } from 'solid-js';
import type { Product } from '../../types';
import ProductCard from './ProductCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ProductGrid: Component<ProductGridProps> = (props) => {
  if (props.isLoading) {
    return (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div class="glass-card animate-pulse">
            <div class="aspect-video bg-gray-200 dark:bg-gray-700" />
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.products || props.products.length === 0) {
    return (
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{props.emptyMessage || 'Nenhum produto encontrado'}</p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {props.products.map(product => (
        <ProductCard product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
