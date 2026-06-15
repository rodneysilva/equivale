import { type Component, createSignal, onMount, For } from 'solid-js';
import UserCard from '../components/community/UserCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usersService } from '../services/users.service';
import type { User } from '../types';

const UsersListPage: Component = () => {
  const [users, setUsers] = createSignal<User[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await usersService.getAll(1, 50);
      setUsers(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Membros</h1>
      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <For each={users()}>{(u) => <UserCard user={u} />}</For>
        </div>
      )}
    </div>
  );
};

export default UsersListPage;
