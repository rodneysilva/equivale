import type { Component, JSX } from 'solid-js';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card: Component<CardProps> = (props) => {
  return (
    <div
      {...props}
      class={`eq-card ${props.hover ? 'eq-card-hover' : ''} ${props.class || ''}`}
    >
      {props.children}
    </div>
  );
};

export default Card;
