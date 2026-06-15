import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Lock, Globe, Users } from 'lucide-solid';
import type { Community } from '../../types';
import Card from '../ui/Card';

interface CommunityCardProps {
  community: Community;
}

const CommunityCard: Component<CommunityCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="overflow-hidden cursor-pointer" onClick={() => navigate(`/communities/${props.community.id}`)}>
      {/* Cover banner with gradient overlay */}
      <div class="h-28 relative" style={{ background: 'var(--color-surface-alt)' }}>
        {props.community.coverUrl && (
          <img src={props.community.coverUrl} alt="" class="w-full h-full object-cover" loading="lazy" />
        )}
        <div class="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div class="absolute top-2 right-2">
          <span class={`eq-badge ${props.community.type === 'private' ? 'eq-badge-warning' : 'eq-badge-primary'}`}>
            {props.community.type === 'private' ? (
              <><Lock size={10} class="mr-1" /> Privada</>
            ) : (
              <><Globe size={10} class="mr-1" /> Aberta</>
            )}
          </span>
        </div>
        <div class="absolute bottom-2 left-3 right-3 flex items-end gap-2">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0" style={{ border: '2px solid var(--color-surface)' }}>
            {props.community.imageUrl ? (
              <img src={props.community.imageUrl} alt={props.community.name} class="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span class="text-sm font-bold text-white" style={{ background: 'var(--color-primary)' }}>{props.community.name[0]}</span>
            )}
          </div>
          <h3 class="font-bold text-sm text-white truncate drop-shadow">{props.community.name}</h3>
        </div>
      </div>
      <div class="p-3">
        <p class="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {props.community.description}
        </p>
        <div class="flex items-center gap-1 mt-2">
          <Users size={12} style={{ color: 'var(--color-text-muted)' }} />
          <span class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{props.community.membersCount} membros</span>
        </div>
      </div>
    </Card>
  );
};

export default CommunityCard;
