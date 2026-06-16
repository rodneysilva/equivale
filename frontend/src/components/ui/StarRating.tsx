import type { Component } from 'solid-js';
import { Star } from 'lucide-solid';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
}

const StarRating: Component<StarRatingProps> = (props) => {
  const maxRating = () => props.maxRating || 5;
  const size = () => props.size || 16;

  return (
    <div class="inline-flex items-center gap-0.5">
      {Array.from({ length: maxRating() }, (_, i) => (
        <Star
          size={size()}
          style={{
            color: i < Math.round(props.rating) ? 'var(--color-primary)' : 'var(--color-border)',
            fill: i < Math.round(props.rating) ? 'var(--color-primary)' : 'transparent',
          }}
        />
      ))}
      {props.showValue && (
        <span class="ml-1 text-sm font-medium eq-text-secondary">
          {props.rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
