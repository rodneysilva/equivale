import type { Component } from 'solid-js';
import { Sun, Moon } from 'lucide-solid';
import { isDark, toggleTheme } from '../../store/theme';

const ThemeToggle: Component = () => {
  return (
    <button
      onClick={toggleTheme}
      class="p-2 rounded eq-btn-ghost"
      aria-label="Toggle theme"
    >
      {isDark() ? (
        <Sun size={18} class="eq-brand" />
      ) : (
        <Moon size={18} class="eq-brand" />
      )}
    </button>
  );
};

export default ThemeToggle;
