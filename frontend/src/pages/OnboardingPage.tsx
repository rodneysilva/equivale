import { type Component, createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Package, Wrench, ArrowRight, ArrowLeft, Check, Users } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProgressDots from '../components/onboarding/ProgressDots';
import { useAuth } from '../store/auth';
import { communitiesService } from '../services/communities.service';
import type { Community } from '../types';

const OnboardingPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [step, setStep] = createSignal(1);
  const [bio, setBio] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal('');
  const [selectedCommunityId, setSelectedCommunityId] = createSignal<string | null>(null);
  const [joining, setJoining] = createSignal(false);

  const [communities] = createResource(async (): Promise<Community[]> => {
    const res = await communitiesService.getAll(1, 6);
    return res.items;
  });

  const user = () => auth.currentUser();

  const handleSaveProfile = async () => {
    setError('');
    setSaving(true);
    try {
      await auth.updateProfile({ bio: bio() });
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCommunity = async (community: Community) => {
    if (selectedCommunityId() === community.id) {
      setSelectedCommunityId(null);
      return;
    }
    setError('');
    setSelectedCommunityId(community.id);
    setJoining(true);
    try {
      await communitiesService.join(community.id);
    } catch (err: any) {
      // ignora erro de "já é membro"
      if (!/já|membro|member/i.test(err.message || '')) {
        setError(err.message || 'Não foi possível entrar na comunidade');
      }
    } finally {
      setJoining(false);
    }
  };

  const finish = () => navigate('/', { replace: true });

  return (
    <div class="max-w-lg mx-auto px-4 py-12" style={{ background: 'var(--color-cream)', minHeight: 'calc(100vh - 7rem)' }}>
      <div class="mb-8">
        <h1 class="eq-display text-2xl text-center mb-2" style={{ color: 'var(--color-primary)' }}>
          Bem-vindo ao eqüivale
        </h1>
        <p class="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          Vamos configurar sua conta em poucos passos
        </p>
      </div>

      <div class="mb-8">
        <ProgressDots step={step()} />
      </div>

      <Show when={step() === 1}>
        <div class="eq-fade-in">
          <Card class="p-6">
            <h2 class="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>Seu perfil</h2>
            <p class="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Conte um pouco sobre você para que outros membros te conheçam
            </p>

            <div class="flex flex-col items-center mb-6">
              <Avatar
                src={user()?.avatarUrl}
                name={user()?.fullName}
                size="xl"
                class="mb-3"
              />
              <p class="text-sm font-medium">{user()?.fullName}</p>
              <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{user()?.username}</p>
            </div>

            <label class="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Bio
            </label>
            <textarea
              value={bio()}
              onInput={(e) => setBio(e.currentTarget.value)}
              placeholder="Escreva uma breve descrição sobre você, seus interesses e o que você oferece..."
              rows={4}
              maxLength={300}
              class="eq-input w-full resize-none"
            />
            <p class="text-xs mt-1 text-right" style={{ color: 'var(--color-text-muted)' }}>
              {bio().length}/300
            </p>

            <Show when={error()}>
              <div class="mt-3 p-2.5 rounded text-xs" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                {error()}
              </div>
            </Show>

            <Button class="w-full mt-4" onClick={handleSaveProfile} disabled={saving()}>
              <Show when={saving()} fallback={<>Continuar <ArrowRight size={14} class="ml-2" /></>}>
                <LoadingSpinner size="w-4 h-4" class="!justify-start" />
              </Show>
            </Button>
          </Card>
        </div>
      </Show>

      <Show when={step() === 2}>
        <div class="eq-fade-in">
          <Card class="p-6">
            <h2 class="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>Encontre sua comunidade</h2>
            <p class="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Escolha uma comunidade para participar
            </p>

            <Show
              when={!communities.loading}
              fallback={<div class="py-8"><LoadingSpinner /></div>}
            >
              <div class="grid grid-cols-1 gap-3 mb-4">
                <For each={communities() || []}>
                  {(community) => {
                    const isSelected = () => selectedCommunityId() === community.id;
                    return (
                      <button
                        type="button"
                        onClick={() => handleSelectCommunity(community)}
                        disabled={joining()}
                        class="text-left p-3 rounded-lg transition-all duration-150 disabled:opacity-60"
                        style={{
                          background: isSelected() ? 'var(--color-primary-light)' : 'transparent',
                          border: isSelected()
                            ? '1.5px solid var(--color-primary)'
                            : '1.5px solid var(--color-border)',
                        }}
                      >
                        <div class="flex items-center gap-3">
                          <div
                            class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                          >
                            <Show when={community.imageUrl} fallback={<Users size={18} />}>
                              <img src={community.imageUrl} alt={community.name} class="w-full h-full object-cover rounded-lg" />
                            </Show>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold truncate">{community.name}</p>
                            <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {community.membersCount} membros
                            </p>
                          </div>
                          <Show when={isSelected()}>
                            <Check size={18} style={{ color: 'var(--color-primary)' }} />
                          </Show>
                        </div>
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>

            <Show when={error()}>
              <div class="mb-3 p-2.5 rounded text-xs" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                {error()}
              </div>
            </Show>

            <div class="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft size={14} class="mr-2" /> Voltar
              </Button>
              <Button class="flex-1" onClick={() => setStep(3)}>
                Continuar <ArrowRight size={14} class="ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </Show>

      <Show when={step() === 3}>
        <div class="eq-fade-in">
          <Card class="p-6">
            <h2 class="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>Publique algo</h2>
            <p class="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Faça sua primeira publicação no eqüivale
            </p>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => navigate('/products/new')}
                class="p-4 rounded-lg text-center transition-all duration-150 hover:scale-[1.02]"
                style={{
                  background: 'var(--color-primary-light)',
                  border: '1.5px solid var(--color-accent)',
                }}
              >
                <Package size={28} class="mx-auto mb-2" style={{ color: 'var(--color-accent-hover)' }} />
                <p class="text-sm font-bold mb-1">Produto</p>
                <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Publique seu primeiro produto
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/services/new')}
                class="p-4 rounded-lg text-center transition-all duration-150 hover:scale-[1.02]"
                style={{
                  background: 'var(--color-primary-light)',
                  border: '1.5px solid var(--color-primary)',
                }}
              >
                <Wrench size={28} class="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p class="text-sm font-bold mb-1">Serviço</p>
                <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Ofereça um serviço
                </p>
              </button>
            </div>

            <div class="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft size={14} class="mr-2" /> Voltar
              </Button>
              <Button variant="ghost" class="flex-1" onClick={finish}>
                Pular e ir para o início
              </Button>
            </div>
          </Card>
        </div>
      </Show>
    </div>
  );
};

export default OnboardingPage;
