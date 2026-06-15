import type { Component, JSX } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: Component<InputProps> = (props) => {
  return (
    <div class="w-full">
      {props.label && (
        <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          {props.label}
        </label>
      )}
      <input
        {...props}
        class={`eq-input ${props.class || ''}`}
      />
      {props.error && (
        <p class="text-sm mt-1" style={{ color: '#dc2626' }}>{props.error}</p>
      )}
    </div>
  );
};

export default Input;
