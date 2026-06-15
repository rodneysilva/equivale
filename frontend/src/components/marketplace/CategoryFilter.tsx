import { type Component, For } from 'solid-js';
import Card from '../ui/Card';

interface CategoryFilterProps {
  categories: Record<string, number>;
  selected: string;
  onSelect: (cat: string) => void;
}

const CategoryFilter: Component<CategoryFilterProps> = (props) => {
  const entries = () => Object.entries(props.categories).sort((a, b) => b[1] - a[1]);

  return (
    <Card class="p-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        Categorias
      </h3>
      <div class="space-y-0.5">
        <button
          onClick={() => props.onSelect('')}
          class={`w-full text-left px-2.5 py-1.5 rounded text-sm flex items-center justify-between transition-colors cursor-pointer ${
            props.selected === '' ? 'font-semibold' : ''
          }`}
          style={props.selected === '' ? { background: 'var(--color-primary-light)', color: 'var(--color-primary)' } : { color: 'var(--color-text-secondary)' }}
        >
          <span>Todas</span>
        </button>
        <For each={entries()}>
          {([cat, count]) => (
            <button
              onClick={() => props.onSelect(props.selected === cat ? '' : cat)}
              class="w-full text-left px-2.5 py-1.5 rounded text-sm flex items-center justify-between transition-colors cursor-pointer"
              style={props.selected === cat ? { background: 'var(--color-primary-light)', color: 'var(--color-primary)', 'font-weight': 600 } : { color: 'var(--color-text-secondary)' }}
            >
              <span class="truncate">{cat}</span>
              <span class="text-xs shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>{count}</span>
            </button>
          )}
        </For>
      </div>
    </Card>
  );
};

export default CategoryFilter;
