import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { Bell } from 'lucide-solid';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { notificationsService } from '../services/notifications.service';
import type { AppNotification } from '../types';

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

const typeIcon: Record<string, string> = {
  Purchase: '🛒',
  Sale: '💰',
  OrderConfirmed: '✅',
  Shipped: '🚚',
  Delivered: '📦',
  Comment: '💬',
  Review: '⭐',
};

const NotificationsPage: Component = () => {
  const [items, setItems] = createSignal<AppNotification[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const res = await notificationsService.getAll(1, 50);
      setItems(res.data);
      await notificationsService.markAllRead().catch(() => {});
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="flex items-center gap-2 mb-6">
        <Bell size={22} class="eq-brand" />
        <h1 class="text-2xl font-bold eq-display eq-text">Notificações</h1>
      </div>

      <Show when={!loading()} fallback={<LoadingSpinner />}>
        <Show when={items().length > 0} fallback={
          <Card class="p-8 text-center eq-text-muted">
            <Bell size={32} class="mx-auto mb-2 opacity-40" />
            <p>Você não tem notificações.</p>
          </Card>
        }>
          <div class="space-y-2">
            <For each={items()}>
              {(n) => (
                <Card
                  class="p-3.5 flex items-start gap-3"
                  style={n.read ? {} : { background: 'var(--color-primary-light)' }}
                >
                  <span class="text-xl shrink-0">{typeIcon[n.type] ?? '🔔'}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm eq-text">{n.description ?? 'Notificação'}</p>
                    <p class="text-xs eq-text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  <Show when={!n.read}>
                    <span class="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--color-terracota)' }} />
                  </Show>
                </Card>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default NotificationsPage;
