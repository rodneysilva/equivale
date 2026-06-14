import type { Component } from 'solid-js';
import type { Community } from '../../types';
import CommunityCard from './CommunityCard';

interface CommunityListProps {
  communities: Community[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const CommunityList: Component<CommunityListProps> = (props) => {
  if (props.isLoading) {
    return (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div class="glass-card animate-pulse">
            <div class="h-24 bg-gray-200 dark:bg-gray-700" />
            <div class="p-4 space-y-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!props.communities || props.communities.length === 0) {
    return (
      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">{props.emptyMessage || 'Nenhuma comunidade encontrada'}</p>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.communities.map(community => (
        <CommunityCard community={community} />
      ))}
    </div>
  );
};

export default CommunityList;
