import { type Component, For, Show } from 'solid-js';
import type { Service } from '../../types';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  services: Service[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ServiceGrid: Component<ServiceGridProps> = (props) => {
  return (
    <Show
      when={!props.isLoading}
      fallback={
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={Array.from({ length: 6 })}>
            {() => (
              <div class="eq-card animate-pulse overflow-hidden">
                <div class="aspect-video" style={{ background: 'var(--color-border-light)' }} />
                <div class="p-3 space-y-2">
                  <div class="h-3 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
                  <div class="h-2 rounded w-full" style={{ background: 'var(--color-border-light)' }} />
                </div>
              </div>
            )}
          </For>
        </div>
      }
    >
      <Show
        when={props.services && props.services.length > 0}
        fallback={
          <div class="text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>{props.emptyMessage || 'Nenhum serviço encontrado'}</p>
          </div>
        }
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={props.services}>
            {(service) => <ServiceCard service={service} />}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default ServiceGrid;
