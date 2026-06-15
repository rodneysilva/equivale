import { createSignal, type Component } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Menu, X, Wallet, User, LogOut, Shield, ChevronDown } from 'lucide-solid';
import { useAuth } from '../../store/auth';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { path: '/communities', label: 'Comunidades' },
  { path: '/products', label: 'Produtos' },
  { path: '/services', label: 'Serviços' },
];

const Navbar: Component = () => {
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <nav class="fixed top-0 left-0 right-0 z-50 eq-nav">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="flex items-center justify-between h-14">
            {/* Logo */}
            <button
              onClick={() => handleNav('/')}
              class="text-lg font-bold eq-brand cursor-pointer tracking-tight"
            >
              equivale
            </button>

            {/* Desktop Nav Links */}
            <div class="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  onClick={() => handleNav(link.path)}
                  class={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    location.pathname === link.path
                      ? 'eq-brand'
                      : 'hover:bg-[var(--color-border-light)]'
                  }`}
                  style={{ color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div class="flex items-center gap-2">
              <ThemeToggle />

              {auth.isAuthenticated() && auth.currentUser() && (
                <>
                  <button
                    onClick={() => handleNav('/wallet')}
                    class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium eq-badge eq-badge-primary cursor-pointer"
                  >
                    <Wallet size={12} />
                    {auth.currentUser()!.walletBalance} EQL
                  </button>

                  <div class="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen())}
                      class="flex items-center gap-1.5 p-1 rounded eq-btn-ghost"
                    >
                      <div class="eq-avatar w-7 h-7 text-xs">
                        {(auth.currentUser()!.fullName || auth.currentUser()!.username)[0].toUpperCase()}
                      </div>
                      <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                    </button>

                    {dropdownOpen() && (
                      <div class="absolute right-0 top-full mt-1 w-44 eq-card p-1.5 z-50">
                        <button
                          onClick={() => { handleNav('/profile'); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost"
                        >
                          <User size={14} /> Perfil
                        </button>
                        <button
                          onClick={() => { handleNav('/wallet'); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost"
                        >
                          <Wallet size={14} /> Carteira
                        </button>
                        {auth.currentUser()!.role === 'admin' && (
                          <button
                            onClick={() => { handleNav('/admin'); setDropdownOpen(false); }}
                            class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost"
                          >
                            <Shield size={14} /> Admin
                          </button>
                        )}
                        <hr class="my-1 eq-divider" />
                        <button
                          onClick={() => { auth.logout(); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost"
                          style={{ color: '#dc2626' }}
                        >
                          <LogOut size={14} /> Sair
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!auth.isAuthenticated() && (
                <div class="flex items-center gap-2">
                  <button
                    onClick={() => handleNav('/login')}
                    class="px-3 py-1.5 rounded text-sm font-medium eq-btn-ghost"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    class="eq-btn eq-btn-sm"
                  >
                    Criar conta
                  </button>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen())}
                class="md:hidden p-1.5 rounded eq-btn-ghost"
              >
                {mobileOpen() ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen() && (
        <div class="fixed inset-0 z-40 md:hidden">
          <div class="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div class="absolute top-14 left-0 right-0 eq-nav p-3 space-y-0.5">
            {navLinks.map(link => (
              <button
                onClick={() => handleNav(link.path)}
                class={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'eq-brand'
                    : 'eq-btn-ghost'
                }`}
              >
                {link.label}
              </button>
            ))}
            {auth.isAuthenticated() && (
              <>
                <button onClick={() => handleNav('/wallet')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <Wallet size={14} /> Carteira ({auth.currentUser()!.walletBalance} EQL)
                </button>
                <button onClick={() => handleNav('/profile')} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2">
                  <User size={14} /> Perfil
                </button>
                <button onClick={() => { auth.logout(); setMobileOpen(false); }} class="w-full text-left px-3 py-2.5 rounded text-sm eq-btn-ghost flex items-center gap-2" style={{ color: '#dc2626' }}>
                  <LogOut size={14} /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div class="h-14" />
    </>
  );
};

export default Navbar;
