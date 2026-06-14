import { type Component, createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { ArrowLeft, Users, MessageSquare, UserPlus, UserMinus } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { communitiesService } from '../services/communities.service';
import { useAuth } from '../store/auth';
import type { Community } from '../types';

const CommunityDetailPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [community, setCommunity] = createSignal<Community | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [isMember, setIsMember] = createSignal(false);
  const [actionLoading, setActionLoading] = createSignal(false);

  createEffect(() => {
    loadCommunity();
  });

  const loadCommunity = async () => {
    setLoading(true);
    try {
      const data = await communitiesService.getById(params.id);
      setCommunity(data);
    } catch {
      setError('Comunidade não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      await communitiesService.join(params.id);
      setIsMember(true);
      setCommunity(prev => prev ? { ...prev, membersCount: prev.membersCount + 1 } : null);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await communitiesService.leave(params.id);
      setIsMember(false);
      setCommunity(prev => prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : null);
    } catch (err: any) {
      setError(err.message || 'Erro ao sair');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {loading() ? (
        <LoadingSpinner class="py-20" />
      ) : error() ? (
        <GlassCard class="p-8 text-center">
          <p class="text-gray-500 dark:text-gray-400">{error()}</p>
        </GlassCard>
      ) : community() ? (
        <div class="space-y-6">
          {/* Cover */}
          <div class="relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            {community()!.coverUrl && (
              <img src={community()!.coverUrl} alt="" class="w-full h-full object-cover" />
            )}
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Info */}
          <div class="flex flex-col sm:flex-row items-start gap-4 -mt-16 relative z-10 px-4 sm:px-0">
            <div class="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
              {community()!.imageUrl ? (
                <img src={community()!.imageUrl} alt={community()!.name} class="w-full h-full object-cover" />
              ) : (
                <span class="text-3xl font-bold gradient-text">{community()!.name[0]}</span>
              )}
            </div>
            <div class="flex-1">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{community()!.name}</h1>
              <p class="text-gray-500 dark:text-gray-400 mt-2">{community()!.description}</p>
              <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Users size={16} />
                  {community()!.membersCount} membros
                </div>
                <div class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MessageSquare size={16} />
                  {community()!.postsCount} posts
                </div>
              </div>
            </div>
            <div class="shrink-0">
              {isMember() ? (
                <LiquidButton variant="outline" onClick={handleLeave} disabled={actionLoading()}>
                  <UserMinus size={18} class="mr-2" />
                  Sair
                </LiquidButton>
              ) : (
                <LiquidButton onClick={handleJoin} disabled={actionLoading()}>
                  <UserPlus size={18} class="mr-2" />
                  Participar
                </LiquidButton>
              )}
            </div>
          </div>

          {error() && (
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error()}
            </div>
          )}

          {/* Posts placeholder */}
          <GlassCard class="p-8 text-center">
            <MessageSquare size={32} class="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p class="text-gray-500 dark:text-gray-400">Posts da comunidade em breve</p>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
};

export default CommunityDetailPage;
