import { type Component, Show, type JSX } from 'solid-js';
import Button from './Button';

interface EmptyStateProps {
  icon?: Component<{ size?: number | string; class?: string; style?: JSX.CSSProperties }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  class?: string;
}

const EmptyState: Component<EmptyStateProps> = (props) => {
  const Icon = props.icon;

  return (
    <div class={`text-center py-12 ${props.class || ''}`}>
      <Show when={Icon}>
        <div
          class="mx-auto mb-4 flex items-center justify-center"
          style={{
            width: '80px',
            height: '80px',
            'border-radius': '50%',
            background: 'var(--color-surface-alt)',
          }}
        >
          {Icon && <Icon size={40} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </Show>
      <h3 class="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
        {props.title}
      </h3>
      <Show when={props.description}>
        <p class="text-sm max-w-sm mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {props.description}
        </p>
      </Show>
      <Show when={props.actionLabel && props.onAction}>
        <Button variant="outline" size="md" onClick={props.onAction}>
          {props.actionLabel}
        </Button>
      </Show>
    </div>
  );
};

export default EmptyState;
