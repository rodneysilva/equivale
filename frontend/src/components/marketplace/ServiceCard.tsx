import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
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
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-alt)' }}>
            {props.service.imageUrl ? (
              <img src={props.service.imageUrl} alt={props.service.title} class="w-full h-full rounded object-cover" />
            ) : (
              <svg class="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{props.service.title}</h3>
            <p class="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{props.service.description}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 eq-divider">
          <span class="text-sm font-bold eq-accent">{props.service.price} EQL</span>
          {props.service.providerName && (
            <div class="flex items-center gap-1.5">
              <Avatar name={props.service.providerName} size="sm" />
              <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{props.service.providerName}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
