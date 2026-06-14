import type { Component } from 'solid-js';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: any;
}

const Badge: Component<BadgeProps> = (props) => {
  const variantClass = () => {
    switch (props.variant) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'danger': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'liquid-badge';
    }
  };

  return (
    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClass()}`}>
      {props.children}
    </span>
  );
};

export default Badge;
