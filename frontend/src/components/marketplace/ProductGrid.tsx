import { type Component, For, Show } from 'solid-js';
import { Package } from 'lucide-solid';
import type { Product } from '../../types';
import ProductCard from './ProductCard';
import EmptyState from '../ui/EmptyState';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ProductGrid: Component<ProductGridProps> = (props) => {
  return (
    <Show
      when={!props.isLoading}
      fallback={
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <For each={Array.from({ length: 6 })}>
            {() => (
              <div class="eq-card overflow-hidden animate-pulse">
                <div class="aspect-square" style={{ background: 'var(--color-border-light)' }} />
                <div class="p-2 space-y-1.5">
                  <div class="h-2 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
                  <div class="h-2.5 rounded w-1/2" style={{ background: 'var(--color-border-light)' }} />
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
          <EmptyState
            icon={Package}
            title={props.emptyTitle || 'Nenhum produto encontrado'}
            description={props.emptyDescription}
            actionLabel={props.actionLabel}
            onAction={props.onAction}
          />
        }
      >
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <For each={props.products}>
            {(product) => <ProductCard product={product} />}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default ProductGrid;
