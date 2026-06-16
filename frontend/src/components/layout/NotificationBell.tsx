import { createSignal, onMount, onCleanup, Show, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Bell } from 'lucide-solid';
import { notificationsService } from '../../services/notifications.service';
import { useAuth } from '../../store/auth';

const NotificationBell: Component = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = createSignal(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const refresh = async () => {
    if (!auth.isAuthenticated()) { setUnread(0); return; }
    try { setUnread(await notificationsService.getUnreadCount()); }
    catch { /* ignore — não bloqueia a UI */ }
  };

  onMount(() => {
    refresh();
    timer = setInterval(refresh, 60_000);
  });
  onCleanup(() => { if (timer) clearInterval(timer); });

  return (
    <button
      onClick={() => navigate('/notifications')}
      class="relative p-2 rounded eq-btn-ghost"
      aria-label="Notificações"
    >
      <Bell size={22} class="eq-brand hidden sm:block" />
      <Bell size={18} class="eq-brand sm:hidden" />
      <Show when={unread() > 0}>
        <span
          class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: 'var(--color-terracota)', color: 'var(--color-surface)' }}
        >
          {unread() > 99 ? '99+' : unread()}
        </span>
      </Show>
    </button>
  );
};

export default NotificationBell;
