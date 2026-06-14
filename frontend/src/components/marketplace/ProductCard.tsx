import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Product } from '../../types';
import GlassCard from '../ui/GlassCard';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <GlassCard hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/products/${props.product.id}`)}>
      {/* Image */}
      <div class="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 relative">
        {props.product.imageUrl ? (
          <img src={props.product.imageUrl} alt={props.product.title} class="w-full h-full object-cover" />
        ) : (
          <div class="w-full h-full flex items-center justify-center text-indigo-400">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div class="absolute top-2 left-2">
          <Badge variant={props.product.condition === 'new' ? 'info' : props.product.condition === 'used' ? 'warning' : 'success'}>
            {props.product.condition === 'new' ? 'Novo' : props.product.condition === 'used' ? 'Usado' : 'Recondicionado'}
          </Badge>
        </div>
      </div>
      {/* Content */}
      <div class="p-4">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">{props.product.title}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{props.product.description}</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-lg font-bold gradient-text">{props.product.price} EQL</span>
          {props.product.sellerName && (
            <div class="flex items-center gap-1.5">
              <Avatar name={props.product.sellerName} size="sm" />
              <span class="text-xs text-gray-500 dark:text-gray-400">{props.product.sellerName}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;
