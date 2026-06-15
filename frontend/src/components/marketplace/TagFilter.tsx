import { type Component, For } from 'solid-js';
import Card from '../ui/Card';

interface TagFilterProps {
  tags: string[];
  selected?: string;
  onSelect: (tag: string) => void;
}

const TagFilter: Component<TagFilterProps> = (props) => {
  if (props.tags.length === 0) return null;

  return (
    <Card class="p-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        Tags
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <For each={props.tags}>
          {(tag) => (
            <button
              onClick={() => props.onSelect(props.selected === tag ? '' : tag)}
              class="text-xs px-2 py-1 rounded-full transition-colors"
              style={
                props.selected === tag
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
              }
            >
              {tag}
            </button>
          )}
        </For>
      </div>
    </Card>
  );
};

export default TagFilter;
