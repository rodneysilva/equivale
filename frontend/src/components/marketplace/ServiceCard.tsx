import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Service } from '../../types';
import GlassCard from '../ui/GlassCard';
import Avatar from '../ui/Avatar';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: Component<ServiceCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <GlassCard hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/services/${props.service.id}`)}>
      <div class="p-5">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center shrink-0">
            {props.service.imageUrl ? (
              <img src={props.service.imageUrl} alt={props.service.title} class="w-full h-full rounded-xl object-cover" />
            ) : (
              <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">{props.service.title}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{props.service.description}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span class="text-lg font-bold gradient-text">{props.service.price} EQL</span>
          {props.service.providerName && (
            <div class="flex items-center gap-1.5">
              <Avatar name={props.service.providerName} size="sm" />
              <span class="text-xs text-gray-500 dark:text-gray-400">{props.service.providerName}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ServiceCard;
