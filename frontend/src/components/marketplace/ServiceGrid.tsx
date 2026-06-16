import { type Component, For, Show } from 'solid-js';
import { Zap } from 'lucide-solid';
import type { Service } from '../../types';
import ServiceCard from './ServiceCard';
import EmptyState from '../ui/EmptyState';

interface ServiceGridProps {
  services: Service[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ServiceGrid: Component<ServiceGridProps> = (props) => {
  return (
    <Show
      when={!props.isLoading}
      fallback={
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <For each={Array.from({ length: 6 })}>
            {() => (
              <div class="eq-card overflow-hidden animate-pulse">
                <div class="aspect-square" style={{ background: 'var(--color-border-light)' }} />
                <div class="p-2 space-y-1.5">
                  <div class="h-2 rounded w-3/4" style={{ background: 'var(--color-border-light)' }} />
                  <div class="h-2.5 rounded w-1/2" style={{ background: 'var(--color-border-light)' }} />
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
          <EmptyState
            icon={Zap}
            title={props.emptyTitle || 'Nenhum serviço encontrado'}
            description={props.emptyDescription}
            actionLabel={props.actionLabel}
            onAction={props.onAction}
          />
        }
      >
        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <For each={props.services}>
            {(service) => <ServiceCard service={service} />}
          </For>
        </div>
      </Show>
    </Show>
  );
};

export default ServiceGrid;
