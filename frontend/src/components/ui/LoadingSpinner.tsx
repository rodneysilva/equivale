import type { Component } from 'solid-js';

const LoadingSpinner: Component<{ size?: string; class?: string }> = (props) => {
  return (
    <div class={`flex items-center justify-center ${props.class || ''}`}>
      <div
        class={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500 ${props.size || 'w-8 h-8'}`}
      />
    </div>
  );
};

export default LoadingSpinner;
