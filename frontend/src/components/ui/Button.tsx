import type { Component, JSX } from 'solid-js';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: Component<ButtonProps> = (props) => {
  const variantClass = () => {
    const variant = props.variant || 'primary';
    if (variant === 'primary') return 'eq-btn';
    if (variant === 'outline') return 'eq-btn-outline';
    return 'eq-btn-ghost';
  };

  const sizeClass = () => {
    const size = props.size || 'md';
    if (size === 'sm') return 'eq-btn-sm';
    if (size === 'lg') return 'eq-btn-lg';
    return 'eq-btn-md';
  };

  return (
    <button
      {...props}
      class={`${variantClass()} ${sizeClass()} ${props.class || ''}`}
    >
      {props.children}
    </button>
  );
};

export default Button;
