import type { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { User } from '../../types';
import Card from '../ui/Card';

interface UserCardProps {
  user: User;
}

const UserCard: Component<UserCardProps> = (props) => {
  const navigate = useNavigate();

  return (
    <Card hover class="p-3 cursor-pointer text-center" onClick={() => navigate(`/users/${props.user.id}`)}>
      <div class="eq-avatar w-14 h-14 mx-auto mb-2 overflow-hidden">
        {props.user.avatarUrl ? (
          <img src={props.user.avatarUrl} alt={props.user.fullName} class="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span class="text-lg font-bold">{props.user.fullName?.[0]?.toUpperCase() ?? '?'}</span>
        )}
      </div>
      <p class="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>{props.user.fullName}</p>
      {props.user.bio && (
        <p class="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{props.user.bio}</p>
      )}
    </Card>
  );
};

export default UserCard;
