import { type Component, For, createSignal, onMount } from 'solid-js';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-solid';
import { useToast, type ToastItem } from '../../store/toast';

const iconMap: Record<ToastItem['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastItem['type'], string> = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  info: 'var(--color-primary)',
  warning: '#f59e0b',
};

interface ToastBarProps {
  toast: ToastItem;
  onClose: (id: number) => void;
}

const ToastBar: Component<ToastBarProps> = (props) => {
  const Icon = iconMap[props.toast.type];
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    requestAnimationFrame(() => setMounted(true));
  });

  return (
    <div
      role={props.toast.type === 'error' || props.toast.type === 'warning' ? 'alert' : 'status'}
      aria-live={props.toast.type === 'error' || props.toast.type === 'warning' ? 'assertive' : 'polite'}
      class="eq-card"
      style={{
        'min-width': '280px',
        'max-width': '400px',
        padding: '12px 16px',
        display: 'flex',
        'align-items': 'flex-start',
        gap: '10px',
        'border-left': `4px solid ${colorMap[props.toast.type]}`,
        opacity: mounted() ? '1' : '0',
        transform: mounted() ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s ease-out',
      }}
    >
      <Icon size={18} style={{ color: colorMap[props.toast.type], 'margin-top': '1px', 'flex-shrink': '0' }} />
      <span class="text-sm" style={{ color: 'var(--color-text)', flex: '1' }}>
        {props.toast.message}
      </span>
      <button
        aria-label="Fechar"
        onClick={() => props.onClose(props.toast.id)}
        style={{
          'flex-shrink': '0',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          'line-height': '1',
          padding: '0',
          background: 'none',
          border: 'none',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer: Component = () => {
  const { toasts, remove } = useToast();

  return (
    <div
      class="fixed top-4 right-4 left-4 sm:left-auto z-[9999]"
      style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '8px',
        'pointer-events': 'none',
        'align-items': 'flex-end',
      }}
    >
      <For each={toasts()}>
        {(toast) => (
          <div style={{ 'pointer-events': 'auto', 'max-width': '100%' }}>
            <ToastBar toast={toast} onClose={remove} />
          </div>
        )}
      </For>
    </div>
  );
};

export default ToastContainer;
