import { createSignal, createEffect } from 'solid-js';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('eql_theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const [isDark, setIsDark] = createSignal(getInitialTheme());

function toggleTheme(): void {
  setIsDark(prev => !prev);
}

createEffect(() => {
  const dark = isDark();
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('eql_theme', dark ? 'dark' : 'light');
});

export { isDark, toggleTheme };
