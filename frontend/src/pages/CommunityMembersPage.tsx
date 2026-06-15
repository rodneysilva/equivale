import { type Component, createSignal, onMount, For, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, Shield, ExternalLink } from 'lucide-solid';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { communitiesService, type CommunityMember } from '../services/communities.service';
import { usersService } from '../services/users.service';
import { getSocialLinkIcon, getSocialLinkLabel } from '../data/avatars';
import type { User } from '../types';

const CommunityMembersPage: Component = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = createSignal<CommunityMember[]>([]);
  const [profiles, setProfiles] = createSignal<Record<string, User>>({});
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      const allMembers = await communitiesService.getMembers(params.id);
      setMembers(allMembers);
      // Load full profiles for each member
      const profileEntries = await Promise.all(
        allMembers.map(async m => {
          try { return [m.id, await usersService.getById(m.id)] as const; }
          catch { return [m.id, null] as const; }
        })
      );
      const profileMap: Record<string, User> = {};
      for (const [id, user] of profileEntries) {
        if (user) profileMap[id] = user;
      }
      setProfiles(profileMap);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

  return (
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(`/communities/${params.id}`)} class="flex items-center gap-1.5 text-sm eq-link mb-4">
        <ArrowLeft size={14} /> Voltar para a comunidade
      </button>

      <h1 class="flex items-center gap-2 text-xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        <Users size={20} class="eq-brand" /> Membros ({members().length})
      </h1>

      {loading() ? <LoadingSpinner class="py-20" /> : (
        <div class="space-y-3">
          <For each={members()}>
            {(member) => {
              const profile = () => profiles()[member.id];
              return (
                <Card class="p-4">
                  <div class="flex items-start gap-4">
                    {/* Avatar */}
                    <button onClick={() => navigate(`/users/${member.id}`)} class="shrink-0 cursor-pointer">
                      <div class="eq-avatar w-14 h-14 overflow-hidden">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} class="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span class="text-lg font-bold">{member.name[0]?.toUpperCase()}</span>
                        )}
                      </div>
                    </button>

                    {/* Info */}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <button onClick={() => navigate(`/users/${member.id}`)} class="font-semibold hover:underline" style={{ color: 'var(--color-text)' }}>
                          {member.name}
                        </button>
                        {member.isOwner && (
                          <span class="eq-badge eq-badge-primary"><Shield size={10} class="mr-1" /> Criador</span>
                        )}
                        {member.isModerator && !member.isOwner && (
                          <span class="eq-badge eq-badge-info">Moderador</span>
                        )}
                      </div>

                      {/* Bio */}
                      <Show when={profile()?.bio || member.bio}>
                        <p class="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                          {profile()?.bio || member.bio}
                        </p>
                      </Show>

                      {/* Member since */}
                      <Show when={profile()?.createdAt}>
                        <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          Membro desde {formatDate(profile()!.createdAt)}
                        </p>
                      </Show>

                      {/* Social links */}
                      <Show when={profile()?.socialLinks && profile()!.socialLinks!.length > 0}>
                        <div class="flex flex-wrap gap-1.5 mt-2">
                          <For each={profile()!.socialLinks}>
                            {(link) => (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded eq-badge eq-badge-info cursor-pointer hover:opacity-80"
                              >
                                <span>{getSocialLinkIcon(link.type)}</span>
                                <span>{getSocialLinkLabel(link.type)}</span>
                                <ExternalLink size={9} />
                              </a>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>

                    {/* Wallet (only for own profile or show nothing) */}
                    <Show when={profile()}>
                      <div class="text-right shrink-0">
                        <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>Saldo</p>
                        <p class="text-sm font-semibold eq-accent">{profile()!.walletBalance} EQL</p>
                      </div>
                    </Show>
                  </div>
                </Card>
              );
            }}
          </For>
        </div>
      )}
    </div>
  );
};

export default CommunityMembersPage;
