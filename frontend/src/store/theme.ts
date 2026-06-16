import { createSignal } from 'solid-js';

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('eql_theme');
  if (stored) return stored === 'dark';
  return getSystemDark();
}

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}

const [isDark, setIsDark] = createSignal(getInitialTheme());
applyTheme(isDark());

function setTheme(dark: boolean, persist: boolean): void {
  setIsDark(dark);
  applyTheme(dark);
  if (persist) {
    localStorage.setItem('eql_theme', dark ? 'dark' : 'light');
  } else {
    localStorage.removeItem('eql_theme');
  }
}

function toggleTheme(): void {
  setTheme(!isDark(), true);
}

if (typeof window !== 'undefined') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', (e) => {
    if (!localStorage.getItem('eql_theme')) {
      setTheme(e.matches, false);
    }
  });
}

export { isDark, toggleTheme };
