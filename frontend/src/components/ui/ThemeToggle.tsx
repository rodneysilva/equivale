import type { Component } from 'solid-js';
import { Sun, Moon } from 'lucide-solid';
import { isDark, toggleTheme } from '../../store/theme';

const ThemeToggle: Component = () => {
  return (
    <button
      onClick={toggleTheme}
      class="p-2 rounded eq-btn-ghost"
      aria-label="Alternar tema"
    >
      {isDark() ? (
        <Sun size={22} class="eq-brand hidden sm:block" />
      ) : (
        <Moon size={22} class="eq-brand hidden sm:block" />
      )}
      {isDark() ? (
        <Sun size={18} class="eq-brand sm:hidden" />
      ) : (
        <Moon size={18} class="eq-brand sm:hidden" />
      )}
    </button>
  );
};

export default ThemeToggle;
