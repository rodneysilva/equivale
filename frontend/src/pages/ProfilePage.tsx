import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Edit, Save, X, User, Mail, Calendar, Package, ShoppingBag } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../store/auth';

const ProfilePage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [editing, setEditing] = createSignal(false);
  const [fullName, setFullName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [bio, setBio] = createSignal('');
  const [avatarUrl, setAvatarUrl] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');

  createEffect(() => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    if (auth.currentUser()) {
      setFullName(auth.currentUser()!.fullName || '');
      setEmail(auth.currentUser()!.email || '');
      setBio(auth.currentUser()!.bio || '');
      setAvatarUrl(auth.currentUser()!.avatarUrl || '');
    }
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await auth.updateProfile({ fullName: fullName(), bio: bio(), avatarUrl: avatarUrl() });
      setEditing(false);
      setSuccess('Perfil atualizado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    if (auth.currentUser()) {
      setFullName(auth.currentUser()!.fullName || '');
      setBio(auth.currentUser()!.bio || '');
      setAvatarUrl(auth.currentUser()!.avatarUrl || '');
    }
    setEditing(false);
    setError('');
  };

  const user = () => auth.currentUser();

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Perfil</h1>
        {!editing() && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit size={14} class="mr-1.5" /> Editar
          </Button>
        )}
      </div>

      {success() && (
        <div class="mb-4 p-2.5 rounded text-xs" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>{success()}</div>
      )}
      {error() && (
        <div class="mb-4 p-2.5 rounded text-xs" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>
      )}

      {/* Info card */}
      <Card class="p-6 mb-6">
        <div class="flex items-start gap-4">
          <Avatar src={editing() ? avatarUrl() : user()?.avatarUrl} name={fullName() || user()?.username || '?'} size="xl" />
          <div class="flex-1">
            {editing() ? (
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nome completo</label>
                  <input type="text" value={fullName()} onInput={(e) => setFullName(e.currentTarget.value)} class="eq-input" />
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Foto (URL)</label>
                  <input type="url" value={avatarUrl()} onInput={(e) => setAvatarUrl(e.currentTarget.value)} placeholder="https://..." class="eq-input" />
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Bio</label>
                  <textarea value={bio()} onInput={(e) => setBio(e.currentTarget.value)} rows={3} placeholder="Conte um pouco sobre você..." class="eq-input resize-none" />
                </div>
                <div class="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving()}>
                    {saving() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : <><Save size={14} class="mr-1.5" /> Salvar</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div class="space-y-1">
                <h2 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{user()?.fullName || user()?.username}</h2>
                <p class="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Mail size={12} /> {user()?.email}
                </p>
                <p class="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar size={12} /> Membro desde {user()?.createdAt ? formatDate(user()!.createdAt) : '—'}
                </p>
                {user()?.bio && (
                  <p class="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{user()?.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div class="grid grid-cols-2 gap-4">
        <Card class="p-4">
          <div class="flex items-center gap-2">
            <Package size={16} class="eq-brand" />
            <div>
              <p class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>—</p>
              <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Produtos publicados</p>
            </div>
          </div>
        </Card>
        <Card class="p-4">
          <div class="flex items-center gap-2">
            <ShoppingBag size={16} class="eq-brand" />
            <div>
              <p class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>—</p>
              <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Transações realizadas</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
