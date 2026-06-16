import { type Component, createSignal, onMount, onCleanup, For, Show, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Send } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { chatService, type ChatMessage } from '../services/chat.service';
import { transactionsService } from '../services/transactions.service';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import type { Transaction } from '../types';

const POLL_INTERVAL_MS = 5000;

const statusLabel: Record<string, string> = {
  OrderPlaced: 'Pedido criado',
  OrderConfirmed: 'Vendedor confirmou',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Finished: 'Finalizado',
  Cancelled: 'Cancelada',
};

const ChatPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();

  const [tx, setTx] = createSignal<Transaction | null>(null);
  const [messages, setMessages] = createSignal<ChatMessage[]>([]);
  const [draft, setDraft] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [sending, setSending] = createSignal(false);
  const [error, setError] = createSignal('');
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let scrollContainer: HTMLDivElement | undefined;

  const currentUserId = () => auth.currentUser()?.id;

  const loadMessages = async (silent = false) => {
    try {
      const list = await chatService.getMessages(params.id);
      const prevCount = messages().length;
      setMessages(list);
      if (list.length !== prevCount) {
        requestAnimationFrame(() => scrollToBottom());
      }
    } catch (err: any) {
      if (!silent) {
        setError(err?.message === 'Forbidden' || err?.message === 'Unauthorized'
          ? 'Você não tem acesso a este chat.'
          : 'Não foi possível carregar as mensagens.');
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
  };

  onMount(async () => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    try {
      const transaction = await transactionsService.getById(params.id);
      setTx(transaction);
      if (transaction.buyerId !== currentUserId() && transaction.sellerId !== currentUserId()) {
        setError('Você não tem acesso a este chat.');
        setLoading(false);
        return;
      }
      await loadMessages();
    } catch {
      setError('Transação não encontrada.');
    } finally {
      setLoading(false);
    }

    pollTimer = setInterval(() => loadMessages(true), POLL_INTERVAL_MS);
  });

  onCleanup(() => {
    if (pollTimer) clearInterval(pollTimer);
  });

  createEffect(() => {
    // When messages change, ensure scroll
    messages();
    requestAnimationFrame(() => scrollToBottom());
  });

  const otherParty = () => {
    const t = tx();
    if (!t) return { name: '—', role: '' };
    const isBuyer = t.buyerId === currentUserId();
    return {
      name: (isBuyer ? t.sellerName : t.buyerName) ?? '—',
      role: isBuyer ? 'Vendedor' : 'Comprador',
    };
  };

  const send = async () => {
    const content = draft().trim();
    if (!content || sending()) return;
    setSending(true);
    try {
      const msg = await chatService.sendMessage(params.id, content);
      setMessages(prev => [...prev, msg]);
      setDraft('');
      requestAnimationFrame(() => scrollToBottom());
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const isMine = (m: ChatMessage) => m.senderId === currentUserId();

  return (
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <button onClick={() => navigate(`/transactions/${params.id}`)} class="flex items-center gap-1.5 text-sm eq-link mb-3">
        <ArrowLeft size={14} /> Voltar à transação
      </button>

      <Show when={loading()}>
        <LoadingSpinner class="py-20" />
      </Show>

      <Show when={!loading() && error()}>
        <Card class="p-8 text-center"><p style={{ color: 'var(--color-text-muted)' }}>{error()}</p></Card>
      </Show>

      <Show when={!loading() && !error() && tx()}>
        <Card class="p-4 mb-3 shrink-0">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <h1 class="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>{tx()!.itemTitle}</h1>
              <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {otherParty().role}: <strong style={{ color: 'var(--color-text-secondary)' }}>{otherParty().name}</strong>
              </p>
            </div>
            <span class="eq-badge eq-badge-info">{statusLabel[tx()!.status] ?? tx()!.status}</span>
          </div>
        </Card>

        {/* Messages */}
        <div
          ref={scrollContainer}
          class="flex-1 overflow-y-auto rounded-lg p-4 space-y-3"
          style={{ background: 'var(--color-surface-alt)', 'border': '1px solid var(--color-border)' }}
        >
          <Show when={messages().length === 0}>
            <div class="text-center py-8">
              <p class="text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma mensagem ainda. Inicie a conversa.</p>
            </div>
          </Show>
          <For each={messages()}>
            {(m) => (
              <div class={`flex ${isMine(m) ? 'justify-end' : 'justify-start'}`}>
                <div class="max-w-[80%] flex flex-col" style={isMine(m) ? { 'align-items': 'flex-end' } : { 'align-items': 'flex-start' }}>
                  <div
                    class="px-3 py-2 rounded-lg text-sm break-words"
                    style={isMine(m)
                      ? { background: 'var(--color-primary)', color: 'var(--color-surface)', 'border-bottom-right-radius': '2px' }
                      : { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', 'border-bottom-left-radius': '2px' }}
                  >
                    {m.content}
                  </div>
                  <span class="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {m.senderName && !isMine(m) ? `${m.senderName} · ` : ''}{formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Input */}
        <div class="mt-3 shrink-0">
          <div class="flex items-end gap-2">
            <textarea
              value={draft()}
              onInput={(e) => setDraft(e.currentTarget.value)}
              onKeyDown={onKeyDown}
              placeholder="Escreva uma mensagem..."
              rows={1}
              class="eq-input flex-1 resize-none text-sm"
              style={{ 'max-height': '120px' }}
            />
            <Button onClick={send} disabled={!draft().trim() || sending()} size="sm">
              <Send size={14} class="mr-1" /> {sending() ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default ChatPage;
