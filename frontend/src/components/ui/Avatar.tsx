import type { Component } from 'solid-js';
import { User } from 'lucide-solid';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  class?: string;
}

const Avatar: Component<AvatarProps> = (props) => {
  const sizeClass = () => {
    switch (props.size) {
      case 'sm': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      default: return 'w-10 h-10 text-base';
    }
  };

  const initials = () => {
    if (!props.name) return '?';
    return props.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div class={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold overflow-hidden ${sizeClass()} ${props.class || ''}`}>
      {props.src ? (
        <img src={props.src} alt={props.name || 'avatar'} class="w-full h-full object-cover" />
      ) : (
        <span>{initials()}</span>
      )}
    </div>
  );
};

export default Avatar;
