import type { Component } from 'solid-js';
import Card from '../ui/Card';

interface CategoryFilterProps {
  categories: string[];
  selected?: string;
  onSelect: (category: string) => void;
}

const CategoryFilter: Component<CategoryFilterProps> = (props) => {
  return (
    <Card class="p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Categorias</h3>
      <ul class="space-y-0.5">
        <li>
          <button
            onClick={() => props.onSelect('')}
            class={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              !props.selected
                ? 'font-medium'
                : ''
            }`}
            style={{
              background: !props.selected ? 'var(--color-primary-light)' : 'transparent',
              color: !props.selected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            Todas
          </button>
        </li>
        {props.categories.map(cat => (
          <li>
            <button
              onClick={() => props.onSelect(cat)}
              class={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                props.selected === cat ? 'font-medium' : ''
              }`}
              style={{
                background: props.selected === cat ? 'var(--color-primary-light)' : 'transparent',
                color: props.selected === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CategoryFilter;
