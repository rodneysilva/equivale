import { For, type Component } from 'solid-js';

interface ProgressDotsProps {
  step: number;
  total?: number;
}

const ProgressDots: Component<ProgressDotsProps> = (props) => {
  const total = () => props.total ?? 3;
  return (
    <div class="flex items-center justify-center gap-2">
      <For each={Array.from({ length: total() }, (_, i) => i + 1)}>
        {(n) => {
          const isActive = () => n === props.step;
          const isDone = () => n < props.step;
          return (
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
              style={{
                background: isActive() || isDone() ? 'var(--color-primary)' : 'transparent',
                color: isActive() || isDone() ? 'var(--color-cream)' : 'var(--color-text-muted)',
                border: isActive() || isDone()
                  ? '1.5px solid var(--color-primary)'
                  : '1.5px solid var(--color-text-muted)',
              }}
            >
              {n}
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default ProgressDots;
