import type { Component } from 'solid-js';
import { Shield, ShieldOff, Search } from 'lucide-solid';
import type { User } from '../../types';
import GlassCard from '../ui/GlassCard';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import SearchBar from '../marketplace/SearchBar';

interface UserManagementProps {
  users: User[];
  isLoading?: boolean;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  search: string;
  onSearch: (value: string) => void;
}

const UserManagement: Component<UserManagementProps> = (props) => {
  return (
    <div>
      <div class="mb-4">
        <SearchBar value={props.search} onInput={props.onSearch} placeholder="Buscar usuários..." />
      </div>

      {props.isLoading ? (
        <div class="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div class="glass-card p-4 animate-pulse">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <GlassCard class="overflow-hidden">
          <ul class="divide-y divide-gray-200 dark:divide-gray-700">
            {props.users.map(user => (
              <li class="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Avatar name={user.fullName || user.username} src={user.avatarUrl} size="md" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{user.fullName || user.username}</p>
                    <Badge variant={user.role === 'admin' ? 'info' : 'primary'}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                    {user.isBanned && <Badge variant="danger">Banido</Badge>}
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">@{user.username} · {user.email}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{user.walletBalance} EQL</span>
                  {user.isBanned ? (
                    <button
                      onClick={() => props.onUnban(user.id)}
                      class="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      title="Desbanir"
                    >
                      <ShieldOff size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => props.onBan(user.id)}
                      class="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title="Banir"
                    >
                      <Shield size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}
    </div>
  );
};

export default UserManagement;
