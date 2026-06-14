import type { Component, JSX } from 'solid-js';

interface LiquidButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const LiquidButton: Component<LiquidButtonProps> = (props) => {
  const baseClass = () => {
    const variant = props.variant || 'primary';
    const size = props.size || 'md';

    let cls = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    if (variant === 'primary') {
      cls += ' liquid-button';
    } else if (variant === 'outline') {
      cls += ' liquid-button-outline';
    } else {
      cls += ' hover:bg-gray-100 dark:hover:bg-gray-800';
    }

    if (size === 'sm') cls += ' text-sm px-3 py-1.5';
    else if (size === 'lg') cls += ' text-lg px-6 py-3';
    else cls += ' px-5 py-2.5';

    return cls;
  };

  return (
    <button
      {...props}
      class={`${baseClass()} ${props.class || ''}`}
    >
      {props.children}
    </button>
  );
};

export default LiquidButton;
