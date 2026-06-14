import type { Component, JSX } from 'solid-js';

interface GlassCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const GlassCard: Component<GlassCardProps> = (props) => {
  return (
    <div
      {...props}
      class={`glass-card ${props.hover ? 'glass-card-hover' : ''} ${props.class || ''}`}
    >
      {props.children}
    </div>
  );
};

export default GlassCard;
