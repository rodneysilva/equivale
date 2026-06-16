import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../store/auth';

const LoginPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  createEffect(() => { if (auth.isAuthenticated()) navigate('/', { replace: true }); });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await auth.login({ email: email(), password: password() }); const user = auth.currentUser(); navigate(user && !user.bio ? '/onboarding' : '/', { replace: true }); }
    catch (err: any) { setError(err.message || 'Erro ao fazer login'); }
    finally { setLoading(false); }
  };

  return (
    <div class="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-12">
      <Card class="w-full max-w-sm p-6">
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold eq-brand">Entrar</h1>
          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Acesse sua conta</p>
        </div>
        <form onSubmit={handleSubmit} class="space-y-4">
          {error() && (
            <div class="p-2.5 rounded text-xs" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>{error()}</div>
          )}
          <div class="relative">
            <Mail size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} placeholder="Seu e-mail" required class="eq-input pl-9" />
          </div>
          <div class="relative">
            <Lock size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type={showPassword() ? 'text' : 'password'} value={password()} onInput={(e) => setPassword(e.currentTarget.value)} placeholder="Senha" required class="eq-input pl-9 pr-9" />
            <button type="button" onClick={() => setShowPassword(!showPassword())} class="absolute right-3 top-1/2 -translate-y-1/2 eq-btn-ghost p-0">
              {showPassword() ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Requisitos: 8+ caracteres, maiúscula, minúscula, número
          </p>
          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : (
              <>Entrar <ArrowRight size={14} class="ml-2" /></>
            )}
          </Button>
        </form>
        <div class="mt-5 text-center">
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Não tem conta? <button onClick={() => navigate('/register')} class="eq-link">Criar conta</button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
