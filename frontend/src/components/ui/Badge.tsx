import type { Component } from 'solid-js';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: any;
}

const Badge: Component<BadgeProps> = (props) => {
  const variantClass = () => {
    switch (props.variant) {
      case 'success': return 'eq-badge eq-badge-success';
      case 'warning': return 'eq-badge eq-badge-warning';
      case 'danger': return 'eq-badge eq-badge-danger';
      case 'info': return 'eq-badge eq-badge-info';
      default: return 'eq-badge eq-badge-primary';
    }
  };

  return (
    <span class={variantClass()}>
      {props.children}
    </span>
  );
};

export default Badge;
