import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Zap, Clock, MapPin } from 'lucide-solid';
import type { Service } from '../../types';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: Component<ServiceCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/services/${props.service.id}`)}>
      <div class="aspect-video relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-surface-alt))' }}>
        {props.service.imageUrl ? (
          <img src={props.service.imageUrl} alt={props.service.title} class="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div class="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
            <Zap size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
        )}
        <div class="absolute top-2 left-2">
          <span class="eq-badge eq-badge-primary">{props.service.category}</span>
        </div>
      </div>
      <div class="p-3">
        <h3 class="font-medium text-sm leading-snug line-clamp-2" style={{ color: 'var(--color-text)', 'min-height': '2.5rem' }}>{props.service.title}</h3>
        <p class="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{props.service.description}</p>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-lg font-bold eq-accent">{props.service.price}</span>
          <span class="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>EQL</span>
        </div>
        {(props.service.duration || props.service.location) && (
          <div class="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {props.service.duration && (
              <span class="flex items-center gap-1"><Clock size={11} /> {props.service.duration}</span>
            )}
            {props.service.location && (
              <span class="flex items-center gap-1 truncate"><MapPin size={11} /> {props.service.location}</span>
            )}
          </div>
        )}
        {props.service.providerName && (
          <div class="flex items-center gap-1.5 mt-2 pt-2 eq-divider">
            <Avatar name={props.service.providerName} size="sm" />
            <span class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{props.service.providerName}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;
