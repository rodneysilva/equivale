import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: Component<ServiceCardProps> = (props) => {
  const navigate = useNavigate();
  const s = props.service;

  return (
    <div onClick={() => navigate(`/services/${s.id}`)} class="eq-card eq-card-hover overflow-hidden group">
      {/* Image */}
      <div class="relative h-40 bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-950/30 dark:to-violet-900/20 overflow-hidden">
        {s.imageUrl ? (
          <img src={s.imageUrl} alt={s.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div class="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="eq-text-muted opacity-30">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        )}
        {/* Category badge */}
        <div class="absolute top-2 left-2">
          <span class="eq-badge eq-badge-service text-[0.625rem]">{s.category}</span>
        </div>
        {/* Community badge */}
        {s.communityName && (
          <div class="absolute top-2 right-2">
            <span class="eq-badge eq-badge-community text-[0.625rem]">{s.communityName}</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div class="p-3">
        <h3 class="text-sm font-semibold eq-text line-clamp-2 leading-snug mb-1">{s.title}</h3>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold eq-accent">{s.price} <span class="text-xs font-medium">EQL</span></span>
          {s.providerName && (
            <span class="text-[0.6875rem] eq-text-muted truncate ml-2 max-w-[50%]">{s.providerName}</span>
          )}
        </div>
        {(s.duration || s.location) && (
          <div class="flex items-center gap-2 mt-1">
            {s.duration && <span class="text-[0.625rem] eq-text-muted">{s.duration}</span>}
            {s.location && <span class="text-[0.625rem] eq-text-muted truncate">{s.location}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
