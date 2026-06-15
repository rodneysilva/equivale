import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Zap } from 'lucide-solid';
import type { Service } from '../../types';
import Card from '../ui/Card';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: Component<ServiceCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer group" onClick={() => navigate(`/services/${props.service.id}`)}>
      {/* Image */}
      <div class="aspect-square relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface-alt))' }}>
        {props.service.imageUrl ? (
          <img src={props.service.imageUrl} alt={props.service.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div class="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
            <Zap size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
        )}
        {/* Category badge */}
        <span class="absolute top-1.5 left-1.5 text-[0.6rem] font-medium px-1.5 py-0.5 rounded truncate max-w-[80%]" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          {props.service.category}
        </span>
      </div>
      {/* Info */}
      <div class="p-2">
        <h3 class="text-xs font-normal leading-snug line-clamp-2" title={props.service.title} style={{ color: 'var(--color-text)', 'min-height': '2rem' }}>{props.service.title}</h3>
        <div class="flex items-baseline gap-0.5 mt-1">
          <span class="text-sm font-semibold eq-accent">{props.service.price}</span>
          <span class="text-[0.65rem]" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
