import { createSignal, type Component } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Menu, X, Wallet, User, LogOut, Shield, Users, Package, Zap, Moon, Sun } from 'lucide-solid';
import { useAuth } from '../../store/auth';
import { isDark, toggleTheme } from '../../store/theme';
import ThemeToggle from '../ui/ThemeToggle';
import SearchBar from './SearchBar';

const Navbar: Component = () => {
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItem = (path: string, label: string) => (
    <button
      onClick={() => go(path)}
      class="px-2.5 py-1 rounded text-sm font-medium transition-colors"
      style={{
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: isActive(path) ? 'var(--color-primary-light)' : 'transparent',
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <nav class="fixed top-0 left-0 right-0 z-50 eq-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="flex items-center gap-2 h-14">
            {/* Logo — desktop navega home, mobile abre menu */}
            <button onClick={() => {
              if (window.innerWidth < 768) { setMobileOpen(!mobileOpen()); }
              else { go('/'); }
            }} class="flex items-center gap-1.5 shrink-0">
              <img src="/logo.svg" alt="eqüivale" class="h-8 w-auto hidden sm:block" />
              <img src="/favicon.svg" alt="eqüivale" class="w-11 h-11 sm:hidden" />
              <span class="text-base font-bold tracking-tight eq-display sm:hidden">eqüivale</span>
            </button>

            {/* Search — desktop */}
            <div class="flex-1 hidden sm:block mx-2">
              <SearchBar />
            </div>

            {/* Nav links — desktop */}
            <div class="hidden md:flex items-center gap-0.5 shrink-0">
              {navItem('/communities', 'Comunidades')}
              {navItem('/products', 'Produtos')}
              {navItem('/services', 'Serviços')}

              {auth.isAuthenticated() && (
                <>
                  {navItem('/dashboard', 'Painel')}
                  {navItem('/wallet', 'Carteira')}
                </>
              )}

              {auth.isAuthenticated() && auth.currentUser()?.role === 'admin' && (
                <button onClick={() => go('/admin')} class="px-2.5 py-1 rounded text-sm font-medium transition-colors eq-text-danger"
                  style={{ background: isActive('/admin') ? 'var(--color-danger-bg)' : 'transparent' }}>
                  <Shield size={13} class="mr-1 hidden sm:inline" />Admin
                </button>
              )}
            </div>

            {/* Spacer — empurra right side no mobile (onde search esta oculta) */}
            <div class="flex-1 sm:hidden" />

            {/* Right side */}
            <div class="flex items-center gap-1 shrink-0">
              <ThemeToggle />

              {auth.isAuthenticated() ? (
                <>
                  <button onClick={() => go('/wallet')} class="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium eq-badge eq-badge-primary">
                    <Wallet size={11} />
                    {auth.currentUser()!.walletBalance} EQL
                  </button>

                  {/* User dropdown */}
                  <div class="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen())} class="flex items-center gap-1 p-1 rounded eq-btn-ghost">
                      <div class="eq-avatar w-7 h-7 text-xs">
                        {(auth.currentUser()!.fullName || auth.currentUser()!.username)[0].toUpperCase()}
                      </div>
                    </button>
                    {dropdownOpen() && (
                      <>
                        <div class="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div class="absolute right-0 top-full mt-1 w-48 eq-card p-1.5 z-50" style={{ boxShadow: 'var(--shadow-md)' }}>
                          <div class="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--color-border)' }}>
                            <p class="text-sm font-semibold truncate eq-text">{auth.currentUser()!.fullName}</p>
                            <p class="text-xs truncate eq-text-muted">{auth.currentUser()!.email}</p>
                          </div>
                          <button onClick={() => go('/profile')} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                            <User size={14} /> Perfil
                          </button>
                          <button onClick={() => go('/wallet')} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                            <Wallet size={14} /> Carteira
                          </button>
                          {auth.currentUser()!.role === 'admin' && (
                            <button onClick={() => go('/admin')} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                              <Shield size={14} /> Admin
                            </button>
                          )}
                          <hr class="my-1 eq-divider" />
                          <button onClick={() => { auth.logout(); setDropdownOpen(false); }} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost eq-text-danger">
                            <LogOut size={14} /> Sair
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div class="hidden sm:flex items-center gap-1.5">
                  <button onClick={() => go('/login')} class="px-3 py-1.5 rounded text-sm font-medium eq-btn-ghost">Entrar</button>
                  <button onClick={() => go('/register')} class="eq-btn eq-btn-sm">Criar conta</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div class="h-14" />

      {/* Mobile drawer */}
      {mobileOpen() && (
        <div class="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div class="absolute inset-0 bg-black/40" />
          <div class="absolute top-14 left-0 right-0 eq-nav p-4 space-y-1 shadow-lg" onClick={e => e.stopPropagation()}>
            <div class="mb-3"><SearchBar /></div>
            <button onClick={() => go('/')} class="w-full text-left px-3 py-2.5 rounded text-sm font-medium eq-btn-ghost">Início</button>
            <button onClick={() => go('/communities')} class="w-full text-left px-3 py-2.5 rounded text-sm font-medium eq-btn-ghost">Comunidades</button>
            <button onClick={() => go('/products')} class="w-full text-left px-3 py-2.5 rounded text-sm font-medium eq-btn-ghost">Produtos</button>
            <button onClick={() => go('/services')} class="w-full text-left px-3 py-2.5 rounded text-sm font-medium eq-btn-ghost">Serviços</button>
            <hr class="my-1 eq-divider" />
            {!auth.isAuthenticated() ? (
              <>
                <button onClick={() => toggleTheme()} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  {isDark() ? <Sun size={14} /> : <Moon size={14} />} {isDark() ? 'Modo claro' : 'Modo escuro'}
                </button>
                <div class="flex gap-2 pt-1">
                  <button onClick={() => go('/login')} class="flex-1 eq-btn-outline eq-btn-sm">Entrar</button>
                  <button onClick={() => go('/register')} class="flex-1 eq-btn eq-btn-sm">Criar conta</button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => go('/communities/new')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <Users size={14} class="eq-text-community" /> Nova comunidade
                </button>
                <button onClick={() => go('/products/new')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <Package size={14} class="eq-text-product" /> Compartilhar produto
                </button>
                <button onClick={() => go('/services/new')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <Zap size={14} class="eq-text-service" /> Oferecer serviço
                </button>
                <hr class="my-1 eq-divider" />
                <button onClick={() => go('/wallet')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <Wallet size={14} /> Carteira ({auth.currentUser()!.walletBalance} EQL)
                </button>
                <button onClick={() => go('/dashboard')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <User size={14} /> Painel
                </button>
                <button onClick={() => go('/profile')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <User size={14} /> Perfil
                </button>
                {auth.currentUser()?.role === 'admin' && (
                  <button onClick={() => go('/admin')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                    <Shield size={14} /> Admin
                  </button>
                )}
                <hr class="my-1 eq-divider" />
                <button onClick={() => { toggleTheme(); }} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  {isDark() ? <Sun size={14} /> : <Moon size={14} />} {isDark() ? 'Modo claro' : 'Modo escuro'}
                </button>
                <button onClick={() => { auth.logout(); setMobileOpen(false); }} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2 eq-text-danger">
                  <LogOut size={14} /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
