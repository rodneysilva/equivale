import type { Component } from 'solid-js';
import GlassCard from '../ui/GlassCard';

interface CategoryFilterProps {
  categories: string[];
  selected?: string;
  onSelect: (category: string) => void;
}

const CategoryFilter: Component<CategoryFilterProps> = (props) => {
  return (
    <GlassCard class="p-4">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Categorias</h3>
      <ul class="space-y-1">
        <li>
          <button
            onClick={() => props.onSelect('')}
            class={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !props.selected
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
        </li>
        {props.categories.map(cat => (
          <li>
            <button
              onClick={() => props.onSelect(cat)}
              class={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                props.selected === cat
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};

export default CategoryFilter;
