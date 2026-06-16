import { type Component, createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Edit, Save, X, User as UserIcon, ExternalLink, Plus, Trash2, Package, Zap, Users as UsersIcon } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../store/auth';
import { AVATAR_GALLERY, SOCIAL_LINK_TYPES, getSocialLinkIcon, getSocialLinkLabel } from '../data/avatars';
import { usersService } from '../services/users.service';
import type { SocialLink, UserCommunity } from '../types';

const ProfilePage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [editing, setEditing] = createSignal(false);
  const [fullName, setFullName] = createSignal('');
  const [bio, setBio] = createSignal('');
  const [avatarUrl, setAvatarUrl] = createSignal('');
  const [socialLinks, setSocialLinks] = createSignal<SocialLink[]>([]);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');
  const [success, setSuccess] = createSignal('');
  const [communities, setCommunities] = createSignal<UserCommunity[]>([]);

  createEffect(() => {
    if (!auth.isAuthenticated()) { navigate('/login'); return; }
    if (auth.currentUser()) {
      setFullName(auth.currentUser()!.fullName || '');
      setBio(auth.currentUser()!.bio || '');
      setAvatarUrl(auth.currentUser()!.avatarUrl || '');
      setSocialLinks(auth.currentUser()!.socialLinks || []);
    }
  });

  createEffect(() => {
    if (auth.currentUser()?.id) {
      usersService.getCommunities(auth.currentUser()!.id).then(setCommunities).catch(() => {});
    }
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await auth.updateProfile({ fullName: fullName(), bio: bio(), avatarUrl: avatarUrl(), socialLinks: socialLinks() });
      setEditing(false);
      setSuccess('Perfil atualizado!');
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
      setSocialLinks(auth.currentUser()!.socialLinks || []);
    }
    setEditing(false);
    setError('');
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { type: 'website', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'type' | 'url', value: string) => {
    setSocialLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const user = () => auth.currentUser();

  return (
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Meu Perfil</h1>
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${user()?.id}`)}>
            <ExternalLink size={14} class="mr-1.5" /> Perfil público
          </Button>
          {!editing() && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit size={14} class="mr-1.5" /> Editar
            </Button>
          )}
        </div>
      </div>

      {success() && (
        <div class="mb-4 p-2.5 rounded text-xs" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}>{success()}</div>
      )}
      {error() && (
        <div class="mb-4 p-2.5 rounded text-xs" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{error()}</div>
      )}

      {/* Avatar + Info */}
      <Card class="p-6 mb-6">
        <div class="flex items-start gap-4">
          <Avatar src={avatarUrl()} name={fullName() || '?'} size="xl" />
          <div class="flex-1">
            {editing() ? (
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Nome</label>
                  <input type="text" value={fullName()} onInput={(e) => setFullName(e.currentTarget.value)} class="eq-input" />
                </div>
                <div>
                  <label class="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Bio</label>
                  <textarea value={bio()} onInput={(e) => setBio(e.currentTarget.value)} rows={2} placeholder="Conte sobre você..." class="eq-input resize-none" />
                </div>
              </div>
            ) : (
              <div class="space-y-1">
                <h2 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{user()?.fullName}</h2>
                <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user()?.email}</p>
                {user()?.bio && <p class="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{user()?.bio}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Avatar Gallery */}
        <Show when={editing()}>
          <div class="mt-4 pt-4 eq-divider">
            <label class="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Escolha um avatar</label>
            <div class="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              <For each={AVATAR_GALLERY}>
                {(url) => (
                  <button
                    onClick={() => setAvatarUrl(url)}
                    class={`w-full aspect-square rounded-full overflow-hidden transition-all ${avatarUrl() === url ? 'ring-2 ring-offset-2' : ''}`}
                    style={avatarUrl() === url ? { 'ring-color': 'var(--color-primary)' } : { border: '1px solid var(--color-border)' }}
                  >
                    <img src={url} alt="" class="w-full h-full object-cover" loading="lazy" />
                  </button>
                )}
              </For>
            </div>
            <div class="mt-2">
              <input type="url" value={avatarUrl()} onInput={(e) => setAvatarUrl(e.currentTarget.value)} placeholder="Ou cole uma URL..." class="eq-input text-xs" />
            </div>
          </div>
        </Show>

        {/* Social Links */}
        <div class="mt-4 pt-4 eq-divider">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Links sociais e profissionais</label>
            <Show when={editing()}>
              <button onClick={addSocialLink} class="text-xs eq-link flex items-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </Show>
          </div>
          <Show when={socialLinks().length > 0}>
            <div class="flex flex-wrap gap-2">
              <For each={socialLinks()}>
                {(link, i) => (
                  <Show when={!editing()} fallback={
                    <div class="flex items-center gap-1 mb-2">
                      <select
                        value={link.type}
                        onChange={(e) => updateSocialLink(i(), 'type', e.currentTarget.value)}
                        class="eq-input text-xs w-auto py-1"
                      >
                        <For each={SOCIAL_LINK_TYPES}>
                          {(s) => <option value={s.type}>{s.icon} {s.label}</option>}
                        </For>
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onInput={(e) => updateSocialLink(i(), 'url', e.currentTarget.value)}
                        placeholder="https://..."
                        class="eq-input text-xs flex-1 py-1"
                      />
                      <button onClick={() => removeSocialLink(i())} class="p-1" style={{ color: 'var(--color-danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  }>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 eq-badge eq-badge-info cursor-pointer hover:opacity-80">
                      <span>{getSocialLinkIcon(link.type)}</span>
                      <span>{getSocialLinkLabel(link.type)}</span>
                    </a>
                  </Show>
                )}
              </For>
            </div>
          </Show>
          <Show when={socialLinks().length === 0 && !editing()}>
            <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Nenhum link adicionado.</p>
          </Show>
        </div>

        {/* Save buttons */}
        <Show when={editing()}>
          <div class="flex gap-2 mt-4">
            <Button size="sm" onClick={handleSave} disabled={saving()}>
              {saving() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : <><Save size={14} class="mr-1.5" /> Salvar</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
          </div>
        </Show>
      </Card>

      {/* Dashboard quick links */}
      <div class="grid grid-cols-3 gap-3">
        <Card hover class="p-4 cursor-pointer text-center" onClick={() => navigate(`/users/${user()?.id}`)}>
          <Package size={20} class="mx-auto eq-brand mb-1" />
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Meus produtos</p>
        </Card>
        <Card hover class="p-4 cursor-pointer text-center" onClick={() => navigate(`/users/${user()?.id}`)}>
          <Zap size={20} class="mx-auto eq-brand mb-1" />
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Meus serviços</p>
        </Card>
        <Card hover class="p-4 cursor-pointer text-center" onClick={() => navigate('/communities')}>
          <UsersIcon size={20} class="mx-auto eq-brand mb-1" />
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Comunidades ({communities().length})</p>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
