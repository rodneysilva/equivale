import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Community } from '../../types';
import GlassCard from '../ui/GlassCard';

interface CommunityCardProps {
  community: Community;
}

const CommunityCard: Component<CommunityCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <GlassCard hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/communities/${props.community.id}`)}>
      {/* Cover */}
      <div class="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
        {props.community.coverUrl && (
          <img src={props.community.coverUrl} alt="" class="w-full h-full object-cover" />
        )}
      </div>
      <div class="px-4 pb-4">
        <div class="flex items-center gap-3 -mt-6">
          <div class="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
            {props.community.imageUrl ? (
              <img src={props.community.imageUrl} alt={props.community.name} class="w-full h-full object-cover" />
            ) : (
              <span class="text-lg font-bold gradient-text">{props.community.name[0]}</span>
            )}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">{props.community.name}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {props.community.membersCount} membros · {props.community.postsCount} posts
            </p>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{props.community.description}</p>
      </div>
    </GlassCard>
  );
};

export default CommunityCard;
