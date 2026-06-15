import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Lock, Globe } from 'lucide-solid';
import type { Community } from '../../types';
import Card from '../ui/Card';

interface CommunityCardProps {
  community: Community;
}

const CommunityCard: Component<CommunityCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/communities/${props.community.id}`)}>
      {/* Cover */}
      <div class="h-20 relative" style={{ background: 'var(--color-surface-alt)' }}>
        {props.community.coverUrl && (
          <img src={props.community.coverUrl} alt="" class="w-full h-full object-cover" />
        )}
        <div class="absolute top-2 right-2">
          <span class={`eq-badge ${props.community.type === 'private' ? 'eq-badge-warning' : 'eq-badge-primary'}`}>
            {props.community.type === 'private' ? (
              <><Lock size={10} class="mr-1" /> Privada</>
            ) : (
              <><Globe size={10} class="mr-1" /> Aberta</>
            )}
          </span>
        </div>
      </div>
      <div class="px-4 pb-4">
        <div class="flex items-center gap-3 -mt-5">
          <div class="w-10 h-10 rounded eq-card flex items-center justify-center overflow-hidden" style={{ border: '2px solid var(--color-surface)' }}>
            {props.community.imageUrl ? (
              <img src={props.community.imageUrl} alt={props.community.name} class="w-full h-full object-cover" />
            ) : (
              <span class="text-sm font-bold eq-brand">{props.community.name[0]}</span>
            )}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{props.community.name}</h3>
            <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {props.community.membersCount} membros
            </p>
          </div>
        </div>
        <p class="text-xs mt-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {props.community.description}
        </p>
      </div>
    </Card>
  );
};

export default CommunityCard;
