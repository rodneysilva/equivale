import { createSignal } from 'solid-js';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('eql_theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('eql_theme', dark ? 'dark' : 'light');
}

const [isDark, setIsDark] = createSignal(getInitialTheme());
applyTheme(isDark());

function toggleTheme(): void {
  const next = !isDark();
  setIsDark(next);
  applyTheme(next);
}

export { isDark, toggleTheme };
