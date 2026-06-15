import { type Component, For } from 'solid-js';
import Card from '../ui/Card';

interface TagFilterProps {
  tags: Record<string, number>;
  selected: string[];
  onSelect: (tag: string) => void;
}

const TagFilter: Component<TagFilterProps> = (props) => {
  const entries = () => Object.entries(props.tags).sort((a, b) => b[1] - a[1]);

  return (
    <Card class="p-3">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Tags
        </h3>
        {props.selected.length > 0 && (
          <span class="text-xs eq-badge eq-badge-primary">{props.selected.length} selecionada(s)</span>
        )}
      </div>
      <div class="flex flex-wrap gap-1.5">
        <For each={entries()}>
          {([tag, count]) => {
            const isActive = () => props.selected.includes(tag);
            return (
              <button
                onClick={() => props.onSelect(tag)}
                class="text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                style={
                  isActive()
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
                }
              >
                #{tag}
                <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            );
          }}
        </For>
      </div>
    </Card>
  );
};

export default TagFilter;
