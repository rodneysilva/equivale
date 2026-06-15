import type { Component } from 'solid-js';
import type { Service } from '../../types';
import ServiceCard from './ServiceCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ServiceGridProps {
  services: Service[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ServiceGrid: Component<ServiceGridProps> = (props) => {
  if (props.isLoading) {
    return (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div class="eq-card animate-pulse">
            <div class="p-4 space-y-2">
              <div class="h-3 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
              <div class="h-2 rounded w-full" style={{ background: 'var(--color-border-light)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.services || props.services.length === 0) {
    return (
      <div class="text-center py-12">
        <p style={{ color: 'var(--color-text-muted)' }}>{props.emptyMessage || 'Nenhum serviço encontrado'}</p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {props.services.map(service => (
        <ServiceCard service={service} />
      ))}
    </div>
  );
};

export default ServiceGrid;
