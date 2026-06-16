import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-solid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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

  createEffect(() => { if (auth.isAuthenticated()) navigate('/', { replace: true }); });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    if (password() !== confirmPassword()) { setError('As senhas não coincidem'); return; }
    if (password().length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return; }
    if (!/[A-Z]/.test(password())) { setError('A senha deve conter pelo menos uma letra maiúscula'); return; }
    if (!/[a-z]/.test(password())) { setError('A senha deve conter pelo menos uma letra minúscula'); return; }
    if (!/[0-9]/.test(password())) { setError('A senha deve conter pelo menos um número'); return; }
    setLoading(true);
    try {
      await auth.register({ fullName: fullName(), email: email(), password: password(), username: email().split('@')[0] });
      const user = auth.currentUser();
      navigate(user && !user.bio ? '/onboarding' : '/', { replace: true });
    } catch (err: any) { setError(err.message || 'Erro ao registrar'); }
    finally { setLoading(false); }
  };

  return (
    <div class="min-h-[calc(100vh-7rem)] flex items-center justify-center px-4 py-12">
      <Card class="w-full max-w-sm p-6">
        <div class="text-center mb-6">
          <h1 class="text-xl font-bold eq-brand">Criar conta</h1>
          <p class="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Junte-se ao equivale</p>
        </div>
        <form onSubmit={handleSubmit} class="space-y-3">
          {error() && (
            <div class="p-2.5 rounded text-xs" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>{error()}</div>
          )}
          <div class="relative">
            <User size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={fullName()} onInput={(e) => setFullName(e.currentTarget.value)} placeholder="Nome completo" required class="eq-input pl-9" />
          </div>
          <div class="relative">
            <Mail size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} placeholder="Seu e-mail" required class="eq-input pl-9" />
          </div>
          <div class="relative">
            <Lock size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type={showPassword() ? 'text' : 'password'} value={password()} onInput={(e) => setPassword(e.currentTarget.value)} placeholder="Senha (min. 8 caracteres, maiúscula, minúscula, número)" required class="eq-input pl-9 pr-9" />
            <button type="button" onClick={() => setShowPassword(!showPassword())} class="absolute right-3 top-1/2 -translate-y-1/2 eq-btn-ghost p-0">
              {showPassword() ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div class="relative">
            <Lock size={16} class="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="password" value={confirmPassword()} onInput={(e) => setConfirmPassword(e.currentTarget.value)} placeholder="Confirmar senha" required class="eq-input pl-9" />
          </div>
          <Button type="submit" class="w-full" disabled={loading()}>
            {loading() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : (
              <>Criar conta <ArrowRight size={14} class="ml-2" /></>
            )}
          </Button>
        </form>
        <div class="mt-5 text-center">
          <p class="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Já tem conta? <button onClick={() => navigate('/login')} class="eq-link">Entrar</button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
