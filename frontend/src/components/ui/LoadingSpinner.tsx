import type { Component } from 'solid-js';

const LoadingSpinner: Component<{ size?: string; class?: string }> = (props) => {
  return (
    <div class={`flex items-center justify-center ${props.class || ''}`}>
      <div
        class={`eq-spinner ${props.size || 'w-8 h-8'}`}
      />
    </div>
  );
};

export default LoadingSpinner;
