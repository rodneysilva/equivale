import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Users } from 'lucide-solid';
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
      <div class="aspect-square relative" style={{ background: 'var(--color-surface-alt)' }}>
        {props.product.imageUrl ? (
          <img src={props.product.imageUrl} alt={props.product.title} class="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div class="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="p-2.5">
        <h3 class="font-medium text-xs leading-snug line-clamp-2" style={{ color: 'var(--color-text)', 'min-height': '2rem' }}>{props.product.title}</h3>
        <div class="flex items-baseline gap-1 mt-1.5">
          <span class="text-base font-bold eq-accent">{props.product.price}</span>
          <span class="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
        </div>
        {props.product.sellerName && (
          <div class="flex items-center gap-1 mt-1.5">
            <Avatar name={props.product.sellerName} size="sm" />
            <span class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{props.product.sellerName}</span>
          </div>
        )}
        {props.product.communityName && (
          <div class="flex items-center gap-1 mt-2">
            <Users size={11} style={{ color: 'var(--color-primary)' }} />
            <span class="text-xs truncate" style={{ color: 'var(--color-primary)' }}>{props.product.communityName}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
