import type { Component, JSX } from 'solid-js';

interface LiquidInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const LiquidInput: Component<LiquidInputProps> = (props) => {
  return (
    <div class="w-full">
      {props.label && (
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {props.label}
        </label>
      )}
      <input
        {...props}
        class={`liquid-input w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 ${props.class || ''}`}
      />
      {props.error && (
        <p class="text-red-500 text-sm mt-1">{props.error}</p>
      )}
    </div>
  );
};

export default LiquidInput;
