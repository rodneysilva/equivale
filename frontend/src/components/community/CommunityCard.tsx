import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Users, Globe, Lock, MessageCircle } from 'lucide-solid';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    coverUrl?: string;
    ownerId: string;
    ownerName?: string;
    membersCount: number;
    postsCount?: number;
    type: 'open' | 'private';
    createdAt?: string;
  };
}

const CommunityCard: Component<CommunityCardProps> = (props) => {
  const navigate = useNavigate();
  const c = props.community;

  return (
    <div
      onClick={() => navigate(`/communities/${c.id}`)}
      class="eq-card eq-card-hover overflow-hidden group"
    >
      {/* Cover area */}
      <div class="relative h-28 bg-gradient-to-br from-cyan-400 to-cyan-600">
        {c.coverUrl && (
          <img src={c.coverUrl} alt="" class="w-full h-full object-cover absolute inset-0" loading="lazy" />
        )}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Type badge — top right */}
        <div class="absolute top-2 right-2">
          <span class={`eq-badge ${c.type === 'private' ? 'eq-badge-warning' : 'eq-badge-community'} text-[0.625rem]`}>
            {c.type === 'private' ? <Lock size={8} class="mr-0.5" /> : <Globe size={8} class="mr-0.5" />}
            {c.type === 'private' ? 'Privada' : 'Aberta'}
          </span>
        </div>

        {/* Avatar + name — bottom left */}
        <div class="absolute bottom-2 left-3 right-3 flex items-end gap-2.5">
          <div class="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.name} class="w-full h-full object-cover rounded-full" loading="lazy" />
            ) : (
              <span class="text-lg font-bold text-white">{c.name[0].toUpperCase()}</span>
            )}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-bold text-white truncate leading-tight drop-shadow">{c.name}</h3>
            <p class="text-[0.6875rem] text-white/70 truncate">{c.ownerName || ''}</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div class="p-3">
        <p class="text-xs eq-text-secondary line-clamp-2 leading-relaxed mb-2.5">
          {c.description}
        </p>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-[0.6875rem] eq-text-muted">
            <Users size={11} />
            {c.membersCount} membro{c.membersCount !== 1 ? 's' : ''}
          </span>
          {c.postsCount !== undefined && (
            <span class="flex items-center gap-1 text-[0.6875rem] eq-text-muted">
              <MessageCircle size={11} />
              {c.postsCount} post{c.postsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
