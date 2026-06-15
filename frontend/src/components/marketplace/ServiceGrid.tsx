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
        <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
          <For each={Array.from({ length: 8 })}>
            {() => (
              <div class="eq-card animate-pulse overflow-hidden">
                <div class="aspect-video" style={{ background: 'var(--color-border-light)' }} />
                <div class="p-2 space-y-1.5">
                  <div class="h-2 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
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
        <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
          <For each={props.services}>
            {(service) => <ServiceCard service={service} />}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default ServiceGrid;
