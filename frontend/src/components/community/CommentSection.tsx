import { For, Show, createSignal, onMount, type Component } from 'solid-js';
import { Reply, Trash2, Send } from 'lucide-solid';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../store/toast';
import { commentsService } from '../../services/comments.service';
import type { Comment } from '../../types/comment';

interface CommentSectionProps {
  communityId: string;
  postId: string;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  return date.toLocaleDateString();
}

interface CommentItemProps {
  comment: Comment;
  communityId: string;
  postId: string;
  currentUserId?: string;
  depth: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

const MAX_DEPTH = 3;

const CommentItem: Component<CommentItemProps> = (props) => {
  const toast = useToast();
  const [replying, setReplying] = createSignal(false);
  const [replyText, setReplyText] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const [hidden, setHidden] = createSignal(false);

  const isAuthor = () => !!props.currentUserId && props.currentUserId === props.comment.authorId;
  const indent = () => Math.min(props.depth, MAX_DEPTH) * 20;

  const submitReply = async () => {
    const text = replyText().trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await props.onReply(props.comment.id, text);
      setReplyText('');
      setReplying(false);
      toast.success('Resposta enviada.');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao responder.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    setHidden(true);
    try {
      await props.onDelete(props.comment.id);
      toast.success('Comentário removido.');
    } catch (err: any) {
      setHidden(false);
      toast.error(err?.message || 'Erro ao remover comentário.');
    }
  };

  return (
    <Show when={!hidden()}>
      <div style={{ 'margin-left': `${indent()}px` }}>
        <div class="flex gap-2.5 py-2">
          <div class="w-7 h-7 rounded-full overflow-hidden bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Show
              when={props.comment.authorAvatarUrl}
              fallback={
                <span class="text-[0.6875rem] font-bold text-cyan-400">
                  {(props.comment.authorName || '?')[0]?.toUpperCase()}
                </span>
              }
            >
              <img
                src={props.comment.authorAvatarUrl}
                alt=""
                class="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </Show>
          </div>

          <div class="flex-1 min-w-0">
            <div class="eq-card" style={{ padding: '8px 12px' }}>
              <div class="flex items-center justify-between gap-2 mb-0.5">
                <div class="flex items-baseline gap-2 min-w-0">
                  <span class="text-xs font-semibold eq-text-primary truncate">
                    {props.comment.authorName || 'Usuário'}
                  </span>
                  <span class="text-[0.6875rem] eq-text-muted shrink-0">
                    {formatRelative(props.comment.createdAt)}
                  </span>
                </div>
                <Show when={isAuthor()}>
                  <button
                    class="text-[0.6875rem] eq-text-muted hover:text-red-500 transition shrink-0"
                    onClick={remove}
                    aria-label="Remover comentário"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </Show>
              </div>
              <p class="text-sm eq-text-primary whitespace-pre-wrap break-words leading-relaxed">
                {props.comment.content}
              </p>
            </div>

            <Show when={props.depth < MAX_DEPTH}>
              <div class="flex items-center gap-3 mt-1">
                <button
                  class="flex items-center gap-1 text-[0.6875rem] eq-text-muted hover:text-cyan-500 transition"
                  onClick={() => setReplying(!replying())}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Reply size={11} />
                  Responder
                </button>
              </div>

              <Show when={replying()}>
                <div class="mt-2 flex gap-2">
                  <textarea
                    class="eq-input flex-1 text-sm"
                    style={{ 'min-height': '48px', resize: 'vertical' }}
                    placeholder="Escreva uma resposta..."
                    value={replyText()}
                    onInput={(e) => setReplyText(e.currentTarget.value)}
                    disabled={submitting()}
                  />
                  <div class="flex flex-col gap-1">
                    <button
                      class="eq-btn eq-btn-primary !py-1.5 !px-2.5"
                      onClick={submitReply}
                      disabled={submitting() || !replyText().trim()}
                      style={{ cursor: submitting() ? 'wait' : 'pointer' }}
                    >
                      <Send size={12} />
                    </button>
                    <button
                      class="eq-btn !py-1.5 !px-2.5 text-xs"
                      onClick={() => {
                        setReplying(false);
                        setReplyText('');
                      }}
                      disabled={submitting()}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </Show>
            </Show>

            <Show when={props.comment.replies && props.comment.replies.length > 0}>
              <div class="mt-1">
                <For each={props.comment.replies}>
                  {(reply) => (
                    <CommentItem
                      comment={reply}
                      communityId={props.communityId}
                      postId={props.postId}
                      currentUserId={props.currentUserId}
                      depth={props.depth + 1}
                      onReply={props.onReply}
                      onDelete={props.onDelete}
                    />
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};

const CommentSection: Component<CommentSectionProps> = (props) => {
  const auth = useAuth();
  const toast = useToast();
  const [comments, setComments] = createSignal<Comment[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [newContent, setNewContent] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);

  const load = async () => {
    setLoading(true);
    try {
      const tree = await commentsService.getByPost(props.communityId, props.postId);
      setComments(tree);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao carregar comentários.');
    } finally {
      setLoading(false);
    }
  };

  onMount(load);

  const insertIntoTree = (nodes: Comment[], newComment: Comment): Comment[] => {
    if (!newComment.parentCommentId) {
      return [...nodes, newComment];
    }
    return nodes.map((node) => {
      if (node.id === newComment.parentCommentId) {
        return { ...node, replies: [...(node.replies || []), newComment] };
      }
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: insertIntoTree(node.replies, newComment) };
      }
      return node;
    });
  };

  const removeFromTree = (nodes: Comment[], commentId: string): Comment[] => {
    return nodes
      .filter((n) => n.id !== commentId)
      .map((node) => ({
        ...node,
        replies: node.replies ? removeFromTree(node.replies, commentId) : [],
      }));
  };

  const handleCreate = async () => {
    const content = newContent().trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const created = await commentsService.create(props.communityId, props.postId, content);
      setComments((prev) => insertIntoTree(prev, created));
      setNewContent('');
      toast.success('Comentário publicado.');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao publicar comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    const created = await commentsService.create(props.communityId, props.postId, content, parentId);
    setComments((prev) => insertIntoTree(prev, created));
  };

  const handleDelete = async (commentId: string) => {
    await commentsService.delete(props.communityId, props.postId, commentId);
    setComments((prev) => removeFromTree(prev, commentId));
  };

  return (
    <div class="flex flex-col gap-2">
      <h4 class="text-sm font-semibold eq-text-primary flex items-center gap-1.5">
        Comentários
        <span class="eq-text-muted font-normal text-xs">({comments().length})</span>
      </h4>

      <Show when={!loading()} fallback={<p class="text-xs eq-text-muted">Carregando comentários...</p>}>
        <Show
          when={comments().length > 0}
          fallback={<p class="text-xs eq-text-muted py-2">Seja o primeiro a comentar.</p>}
        >
          <For each={comments()}>
            {(comment) => (
              <CommentItem
                comment={comment}
                communityId={props.communityId}
                postId={props.postId}
                currentUserId={auth.currentUser()?.id}
                depth={0}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            )}
          </For>
        </Show>
      </Show>

      <Show
        when={auth.isAuthenticated()}
        fallback={<p class="text-xs eq-text-muted pt-1">Faça login para comentar.</p>}
      >
        <div class="mt-2 flex gap-2">
          <textarea
            class="eq-input flex-1 text-sm"
            style={{ 'min-height': '56px', resize: 'vertical' }}
            placeholder="Escreva um comentário..."
            value={newContent()}
            onInput={(e) => setNewContent(e.currentTarget.value)}
            disabled={submitting()}
          />
          <button
            class="eq-btn eq-btn-primary"
            onClick={handleCreate}
            disabled={submitting() || !newContent().trim()}
            style={{ cursor: submitting() ? 'wait' : 'pointer' }}
          >
            <Send size={14} />
            <span class="ml-1 text-sm">Enviar</span>
          </button>
        </div>
      </Show>
    </div>
  );
};

export default CommentSection;
