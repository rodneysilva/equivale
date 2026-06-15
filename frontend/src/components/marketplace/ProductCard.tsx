import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Product } from '../../types';
import Card from '../ui/Card';

interface ProductCardProps {
  product: Product;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer group" onClick={() => navigate(`/products/${props.product.id}`)}>
      {/* Image */}
      <div class="aspect-square relative overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
        {props.product.imageUrl ? (
          <img src={props.product.imageUrl} alt={props.product.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div class="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {/* Condition badge */}
        <span class="absolute top-1.5 left-1.5 text-[0.6rem] font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-secondary)' }}>
          {props.product.condition === 'new' ? 'Novo' : props.product.condition === 'used' ? 'Usado' : 'Recond.'}
        </span>
      </div>
      {/* Info */}
      <div class="p-2">
        <h3 class="text-[0.7rem] font-normal leading-snug line-clamp-2" style={{ color: 'var(--color-text)', 'min-height': '1.8rem' }}>{props.product.title}</h3>
        <div class="flex items-baseline gap-0.5 mt-1">
          <span class="text-sm font-semibold eq-accent">{props.product.price}</span>
          <span class="text-[0.6rem]" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
