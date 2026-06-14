import type { Component } from 'solid-js';
import { Search } from 'lucide-solid';

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
}

const SearchBar: Component<SearchBarProps> = (props) => {
  return (
    <div class="relative w-full">
      <Search size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={props.placeholder || 'Buscar...'}
        class="liquid-input w-full pl-10 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />
    </div>
  );
};

export default SearchBar;
