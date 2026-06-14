import type { Component } from 'solid-js';
import { Sun, Moon } from 'lucide-solid';
import { isDark, toggleTheme } from '../../store/theme';

const ThemeToggle: Component = () => {
  return (
    <button
      onClick={toggleTheme}
      class="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark() ? (
        <Sun size={20} class="text-yellow-400" />
      ) : (
        <Moon size={20} class="text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
