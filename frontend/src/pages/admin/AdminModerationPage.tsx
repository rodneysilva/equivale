import { type Component, createSignal, onMount, For, Show, Switch, Match } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { ArrowLeft, EyeOff, Eye, Trash2, MessageSquare, FileText } from 'lucide-solid';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../store/toast';
import { moderationService, type ModerationPost, type ModerationComment } from '../../services/moderation.service';

type Tab = 'posts' | 'comments';

const AdminModerationPage: Component = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = createSignal<Tab>('posts');
  const [posts, setPosts] = createSignal<ModerationPost[]>([]);
  const [comments, setComments] = createSignal<ModerationComment[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [busyId, setBusyId] = createSignal<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await moderationService.listPosts(1, 100);
      setPosts(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await moderationService.listComments(1, 100);
      setComments(res.items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  onMount(loadPosts);

  const switchTab = (next: Tab) => {
    if (next === tab()) return;
    setTab(next);
    if (next === 'posts') loadPosts();
    else loadComments();
  };

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('pt-BR'); } catch { return iso; }
  };

  const togglePost = async (post: ModerationPost) => {
    setBusyId(post.id);
    try {
      if (post.isHidden) {
        await moderationService.unhidePost(post.id);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isHidden: false, hiddenAt: null, hiddenBy: null } : p));
        toast.success('Post reexibido');
      } else {
        await moderationService.hidePost(post.id);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isHidden: true } : p));
        toast.success('Post ocultado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha na ação');
    } finally {
      setBusyId(null);
    }
  };

  const removePost = async (post: ModerationPost) => {
    if (!confirm('Excluir este post definitivamente?')) return;
    setBusyId(post.id);
    try {
      await moderationService.deletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast.success('Post excluído');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir');
    } finally {
      setBusyId(null);
    }
  };

  const toggleComment = async (comment: ModerationComment) => {
    setBusyId(comment.id);
    try {
      if (comment.isHidden) {
        await moderationService.unhideComment(comment.id);
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isHidden: false, hiddenAt: null, hiddenBy: null } : c));
        toast.success('Comentário reexibido');
      } else {
        await moderationService.hideComment(comment.id);
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isHidden: true } : c));
        toast.success('Comentário ocultado');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha na ação');
    } finally {
      setBusyId(null);
    }
  };

  const removeComment = async (comment: ModerationComment) => {
    if (!confirm('Excluir este comentário definitivamente?')) return;
    setBusyId(comment.id);
    try {
      await moderationService.deleteComment(comment.id);
      setComments(prev => prev.filter(c => c.id !== comment.id));
      toast.success('Comentário excluído');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/admin')} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Painel
      </button>

      <div class="flex items-center gap-2 mb-6">
        <h1 class="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Moderação de Conteúdo</h1>
        <span class="text-xs eq-badge eq-badge-warning">
          <Switch>
            <Match when={tab() === 'posts'}>{posts().length} posts</Match>
            <Match when={tab() === 'comments'}>{comments().length} comentários</Match>
          </Switch>
        </span>
      </div>

      <div class="flex gap-1 mb-4 p-1 rounded eq-card" style={{ display: 'inline-flex' }}>
        <Button variant={tab() === 'posts' ? 'primary' : 'ghost'} size="sm" onClick={() => switchTab('posts')}>
          <FileText size={13} class="mr-1" /> Posts
        </Button>
        <Button variant={tab() === 'comments' ? 'primary' : 'ghost'} size="sm" onClick={() => switchTab('comments')}>
          <MessageSquare size={13} class="mr-1" /> Comentários
        </Button>
      </div>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <Show
          when={tab() === 'posts'}
          fallback={
            <Show when={comments().length > 0} fallback={
              <p class="text-sm py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>Nenhum comentário.</p>
            }>
              <div class="space-y-2">
                <For each={comments()}>
                  {(comment) => (
                    <Card class="p-3">
                      <div class="flex items-start gap-3">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                              {comment.authorName || 'Usuário removido'}
                            </span>
                            {comment.communityName && (
                              <span class="text-xs eq-badge eq-badge-info">{comment.communityName}</span>
                            )}
                            <Show when={comment.isHidden}>
                              <span class="text-xs eq-badge eq-badge-error">Oculto</span>
                            </Show>
                          </div>
                          <p class="text-sm break-words" style={{ color: 'var(--color-text)' }}>{comment.content}</p>
                          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(comment.createdAt)}</p>
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" disabled={busyId() === comment.id}
                            onClick={() => toggleComment(comment)}
                            title={comment.isHidden ? 'Mostrar' : 'Ocultar'}
                            style={{ color: comment.isHidden ? 'var(--color-success)' : 'var(--color-warning, #BC6C25)' }}>
                            <Show when={comment.isHidden} fallback={<EyeOff size={14} />}><Eye size={14} /></Show>
                          </Button>
                          <Button variant="ghost" size="sm" disabled={busyId() === comment.id}
                            onClick={() => removeComment(comment)} style={{ color: 'var(--color-danger)' }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </Show>
          }
        >
          <Show when={posts().length > 0} fallback={
            <p class="text-sm py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>Nenhum post.</p>
          }>
            <div class="space-y-2">
              <For each={posts()}>
                {(post) => (
                  <Card class="p-3">
                    <div class="flex items-start gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                          <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                            {post.authorName || 'Usuário removido'}
                          </span>
                          <Show when={post.communityName}>
                            <span class="text-xs eq-badge eq-badge-info">{post.communityName}</span>
                          </Show>
                          <Show when={post.isHidden}>
                            <span class="text-xs eq-badge eq-badge-error">Oculto</span>
                          </Show>
                        </div>
                        <p class="text-sm break-words" style={{ color: 'var(--color-text)' }}>{post.content}</p>
                        <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(post.createdAt)}</p>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" disabled={busyId() === post.id}
                          onClick={() => togglePost(post)}
                          title={post.isHidden ? 'Mostrar' : 'Ocultar'}
                          style={{ color: post.isHidden ? 'var(--color-success)' : 'var(--color-warning, #BC6C25)' }}>
                          <Show when={post.isHidden} fallback={<EyeOff size={14} />}><Eye size={14} /></Show>
                        </Button>
                        <Button variant="ghost" size="sm" disabled={busyId() === post.id}
                          onClick={() => removePost(post)} style={{ color: 'var(--color-danger)' }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </For>
            </div>
          </Show>
        </Show>
      )}
    </div>
  );
};

export default AdminModerationPage;
