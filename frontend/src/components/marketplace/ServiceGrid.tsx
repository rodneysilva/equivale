import type { Component } from 'solid-js';
import type { Service } from '../../types';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  services: Service[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ServiceGrid: Component<ServiceGridProps> = (props) => {
  if (props.isLoading) {
    return (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div class="glass-card animate-pulse">
            <div class="p-5 space-y-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.services || props.services.length === 0) {
    return (
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{props.emptyMessage || 'Nenhum serviço encontrado'}</p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.services.map(service => (
        <ServiceCard service={service} />
      ))}
    </div>
  );
};

export default ServiceGrid;
