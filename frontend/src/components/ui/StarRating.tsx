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
          class={
            i < Math.round(props.rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }
        />
      ))}
      {props.showValue && (
        <span class="ml-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {props.rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
