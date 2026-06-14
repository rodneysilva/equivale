import { type Component, createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { User as UserIcon, Mail, Edit3, ShoppingBag, Briefcase, LogIn } from 'lucide-solid';
import GlassCard from '../components/ui/GlassCard';
import LiquidButton from '../components/ui/LiquidButton';
import LiquidInput from '../components/ui/LiquidInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import ProductCard from '../components/marketplace/ProductCard';
import ServiceCard from '../components/marketplace/ServiceCard';
import { authService } from '../services/auth.service';
import { productsService } from '../services/products.service';
import { servicesService } from '../services/services.service';
import { useAuth } from '../store/auth';
import type { Product, Service } from '../types';

const ProfilePage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [products, setProducts] = createSignal<Product[]>([]);
  const [services, setServices] = createSignal<Service[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [editing, setEditing] = createSignal(false);
  const [saving, setSaving] = createSignal(false);

  // Edit form
  const [fullName, setFullName] = createSignal('');
  const [bio, setBio] = createSignal('');

  createEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadUserData();
  });

  const loadUserData = async () => {
    setLoading(true);
    const user = auth.currentUser();
    if (user) {
      setFullName(user.fullName);
      setBio(user.bio || '');
      try {
        const [userProducts, userServices] = await Promise.all([
          productsService.getBySeller(user.id),
          servicesService.getByProvider(user.id),
        ]);
        setProducts(userProducts);
        setServices(userServices);
      } catch {
        // silently fail
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        fullName: fullName(),
        bio: bio(),
      });
      auth.setCurrentUser(updated);
      setEditing(false);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading()) {
    return (
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner class="py-20" />
      </div>
    );
  }

  if (!auth.isAuthenticated() || !auth.currentUser()) {
    return (
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <LogIn size={40} class="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400 mb-4">Faça login para ver seu perfil</p>
        <LiquidButton onClick={() => navigate('/login')}>Entrar</LiquidButton>
      </div>
    );
  }

  const user = auth.currentUser()!;

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <GlassCard class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={user.fullName || user.username} src={user.avatarUrl} size="xl" />
          <div class="flex-1 text-center sm:text-left">
            {editing() ? (
              <div class="space-y-3">
                <LiquidInput
                  label="Nome"
                  value={fullName()}
                  onInput={(e) => setFullName(e.currentTarget.value)}
                />
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    value={bio()}
                    onInput={(e) => setBio(e.currentTarget.value)}
                    rows={3}
                    class="liquid-input w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                <div class="flex gap-2">
                  <LiquidButton size="sm" onClick={handleSave} disabled={saving()}>
                    {saving() ? <LoadingSpinner size="w-4 h-4" class="!justify-start" /> : 'Salvar'}
                  </LiquidButton>
                  <LiquidButton variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancelar</LiquidButton>
                </div>
              </div>
            ) : (
              <>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName || user.username}</h1>
                <p class="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail size={14} />
                  {user.email}
                </p>
                {user.bio && <p class="text-gray-600 dark:text-gray-300 mt-2">{user.bio}</p>}
                <div class="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                  <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{user.walletBalance} EQL</span>
                  <LiquidButton variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit3 size={14} class="mr-1" />
                    Editar
                  </LiquidButton>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* User's products */}
      <div class="mt-8">
        <div class="flex items-center gap-2 mb-4">
          <ShoppingBag size={20} class="text-indigo-500" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Meus Produtos</h2>
        </div>
        {products().length === 0 ? (
          <GlassCard class="p-8 text-center">
            <p class="text-gray-500 dark:text-gray-400">Você ainda não publicou nenhum produto</p>
          </GlassCard>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products().map(p => <ProductCard product={p} />)}
          </div>
        )}
      </div>

      {/* User's services */}
      <div class="mt-8">
        <div class="flex items-center gap-2 mb-4">
          <Briefcase size={20} class="text-indigo-500" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Meus Serviços</h2>
        </div>
        {services().length === 0 ? (
          <GlassCard class="p-8 text-center">
            <p class="text-gray-500 dark:text-gray-400">Você ainda não publicou nenhum serviço</p>
          </GlassCard>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services().map(s => <ServiceCard service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
