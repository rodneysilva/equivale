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
      <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
      <input
        type="text"
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={props.placeholder || 'Buscar...'}
        class="eq-input pl-9"
      />
    </div>
  );
};

export default SearchBar;
