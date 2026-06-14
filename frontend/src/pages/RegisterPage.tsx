import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../store/auth';

const RegisterPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [fullName, setFullName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== confirmPassword()) {
      setError('As senhas não coincidem');
      return;
    }

    if (password().length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await auth.register({
        fullName: fullName(),
        email: email(),
        password: password(),
        username: email().split('@')[0],
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background blobs */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ 'animation-delay': '1s' }} />
        <div class="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ 'animation-delay': '2s' }} />
      </div>

      <GlassCard class="w-full max-w-md p-8 relative z-10">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold gradient-text mb-2">Criar sua conta</h1>
          <p class="text-gray-500 dark:text-gray-400">Junte-se à comunidade equivale</p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          {error() && (
            <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error()}
            </div>
          )}

          <div class="relative">
            <User size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName()}
              onInput={(e) => setFullName(e.currentTarget.value)}
              placeholder="Nome completo"
              required
              class="liquid-input w-full pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div class="relative">
            <Mail size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              placeholder="Seu e-mail"
              required
              class="liquid-input w-full pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div class="relative">
            <Lock size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword() ? 'text' : 'password'}
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="Senha"
              required
              class="liquid-input w-full pl-10 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword())}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword() ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div class="relative">
            <Lock size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword() ? 'text' : 'password'}
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              placeholder="Confirmar senha"
              required
              class="liquid-input w-full pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <LiquidButton type="submit" class="w-full" disabled={loading()}>
            {loading() ? (
              <LoadingSpinner size="w-5 h-5" class="!justify-start" />
            ) : (
              <>
                Criar conta
                <ArrowRight size={18} class="ml-2" />
              </>
            )}
          </LiquidButton>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default RegisterPage;
