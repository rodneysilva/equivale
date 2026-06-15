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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div class="eq-card animate-pulse">
            <div class="aspect-video" style={{ background: 'var(--color-border-light)' }} />
            <div class="p-3 space-y-2">
              <div class="h-3 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
              <div class="h-2 rounded w-full" style={{ background: 'var(--color-border-light)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.products || props.products.length === 0) {
    return (
      <div class="text-center py-12">
        <p style={{ color: 'var(--color-text-muted)' }}>{props.emptyMessage || 'Nenhum produto encontrado'}</p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {props.products.map(product => (
        <ProductCard product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
