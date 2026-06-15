import { type Component, For, Show } from 'solid-js';
import type { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ProductGrid: Component<ProductGridProps> = (props) => {
  return (
    <Show
      when={!props.isLoading}
      fallback={
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <For each={Array.from({ length: 8 })}>
            {() => (
              <div class="eq-card animate-pulse overflow-hidden">
                <div class="aspect-square" style={{ background: 'var(--color-border-light)' }} />
                <div class="p-3 space-y-2">
                  <div class="h-3 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
                  <div class="h-2 rounded w-full" style={{ background: 'var(--color-border-light)' }} />
                </div>
              </div>
            )}
          </For>
        </div>
      }
    >
      <Show
        when={props.products && props.products.length > 0}
        fallback={
          <div class="text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>{props.emptyMessage || 'Nenhum produto encontrado'}</p>
          </div>
        }
      >
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <For each={props.products}>
            {(product) => <ProductCard product={product} />}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default ProductGrid;
