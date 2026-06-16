import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const navigate = useNavigate();
  const p = props.product;

  return (
    <div onClick={() => navigate(`/products/${p.id}`)} class="eq-card eq-card-hover overflow-hidden group">
      {/* Image */}
      <div class="relative h-40 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/20 overflow-hidden">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div class="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="eq-text-muted opacity-30">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        )}
        {/* Category badge */}
        <div class="absolute top-2 left-2">
          <span class="eq-badge eq-badge-product text-[0.625rem]">{p.category}</span>
        </div>
        {/* Community badge */}
        {p.communityName && (
          <div class="absolute top-2 right-2">
            <span class="eq-badge eq-badge-community text-[0.625rem]">{p.communityName}</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div class="p-3">
        <h3 class="text-sm font-semibold eq-text line-clamp-2 leading-snug mb-1">{p.title}</h3>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold eq-accent">{p.price} <span class="text-xs font-medium">EQL</span></span>
          {p.sellerName && (
            <span class="text-[0.6875rem] eq-text-muted truncate ml-2 max-w-[50%]">{p.sellerName}</span>
          )}
        </div>
        {p.condition && p.condition !== 'new' && (
          <span class="inline-block mt-1 text-[0.625rem] eq-text-muted capitalize">{p.condition === 'used' ? 'Usado' : 'Recondicionado'}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
