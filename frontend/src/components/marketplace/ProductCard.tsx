import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Product } from '../../types';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${props.product.id}`)}>
      <div class="aspect-video relative" style={{ background: 'var(--color-surface-alt)' }}>
        {props.product.imageUrl ? (
          <img src={props.product.imageUrl} alt={props.product.title} class="w-full h-full object-cover" />
        ) : (
          <div class="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div class="absolute top-2 left-2">
          <Badge variant={props.product.condition === 'new' ? 'info' : props.product.condition === 'used' ? 'warning' : 'success'}>
            {props.product.condition === 'new' ? 'Novo' : props.product.condition === 'used' ? 'Usado' : 'Recond.'}
          </Badge>
        </div>
      </div>
      <div class="p-3">
        <h3 class="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{props.product.title}</h3>
        <p class="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{props.product.description}</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-sm font-bold eq-accent">{props.product.price} EQL</span>
          {props.product.sellerName && (
            <div class="flex items-center gap-1.5">
              <Avatar name={props.product.sellerName} size="sm" />
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{props.product.sellerName}</span>
            </div>
          )}
        </div>
        {props.product.communityName && (
          <p class="text-xs mt-2 pt-2 eq-divider" style={{ color: 'var(--color-text-muted)' }}>
            {props.product.communityName}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
