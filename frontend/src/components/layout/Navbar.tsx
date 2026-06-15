import { createSignal, type Component } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Menu, X, Wallet, User, LogOut, Shield, ChevronDown, Search } from 'lucide-solid';
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
  const [searchTerm, setSearchTerm] = createSignal('');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleSearch = (e: Event) => {
    e.preventDefault();
    const term = searchTerm().trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
    setMobileOpen(false);
  };

  return (
    <>
      <nav class="fixed top-0 left-0 right-0 z-50 eq-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Row 1: Logo + Search + Actions */}
          <div class="flex items-center gap-3 h-16">
            <button
              onClick={() => handleNav('/')}
              class="text-lg font-bold eq-brand cursor-pointer tracking-tight shrink-0 text-xl"
            >
              equivale
            </button>

            {/* Search bar */}
            <form onSubmit={handleSearch} class="flex-1 max-w-2xl hidden sm:block">
              <div class="relative">
                <input
                  type="text"
                  value={searchTerm()}
                  onInput={(e) => setSearchTerm(e.currentTarget.value)}
                  placeholder="Buscar produtos, serviços, comunidades..."
                  class="eq-input pr-10 h-10"
                />
                <button type="submit" class="absolute right-0 top-0 bottom-0 px-3 flex items-center eq-btn-ghost" style={{ borderLeft: '1px solid var(--color-border)' }}>
                  <Search size={18} />
                </button>
              </div>
            </form>

            <div class="flex items-center gap-1.5 shrink-0">
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
                      <div class="eq-avatar w-8 h-8 text-xs">
                        {(auth.currentUser()!.fullName || auth.currentUser()!.username)[0].toUpperCase()}
                      </div>
                      <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                    </button>

                    {dropdownOpen() && (
                      <>
                        <div class="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div class="absolute right-0 top-full mt-1 w-48 eq-card p-1.5 z-50" style={{ boxShadow: 'var(--shadow-md)' }}>
                          <div class="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--color-border)' }}>
                            <p class="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{auth.currentUser()!.fullName}</p>
                            <p class="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{auth.currentUser()!.email}</p>
                          </div>
                          <button onClick={() => { handleNav('/profile'); setDropdownOpen(false); }} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                            <User size={14} /> Perfil
                          </button>
                          <button onClick={() => { handleNav('/wallet'); setDropdownOpen(false); }} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                            <Wallet size={14} /> Carteira
                          </button>
                          {auth.currentUser()!.role === 'admin' && (
                            <button onClick={() => { handleNav('/admin'); setDropdownOpen(false); }} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost">
                              <Shield size={14} /> Admin
                            </button>
                          )}
                          <hr class="my-1 eq-divider" />
                          <button onClick={() => { auth.logout(); setDropdownOpen(false); }} class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm eq-btn-ghost" style={{ color: '#dc2626' }}>
                            <LogOut size={14} /> Sair
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {!auth.isAuthenticated() && (
                <div class="hidden sm:flex items-center gap-2">
                  <button onClick={() => handleNav('/login')} class="px-3 py-1.5 rounded text-sm font-medium eq-btn-ghost">
                    Entrar
                  </button>
                  <button onClick={() => handleNav('/register')} class="eq-btn eq-btn-sm">
                    Criar conta
                  </button>
                </div>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen())} class="md:hidden p-1.5 rounded eq-btn-ghost">
                {mobileOpen() ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Row 2: Category nav (desktop) */}
          <div class="hidden md:flex items-center gap-1 h-10">
            {navLinks.map(link => (
              <button
                onClick={() => handleNav(link.path)}
                class="px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer"
                style={{ color: location.pathname.startsWith(link.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav (h-16 + h-10 = h-26) */}
      <div class="h-[6.5rem]" />

      {/* Mobile menu */}
      {mobileOpen() && (
        <div class="fixed inset-0 z-40 md:hidden">
          <div class="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div class="absolute top-[6.5rem] left-0 right-0 eq-nav p-3 space-y-0.5">
            <form onSubmit={handleSearch} class="mb-3 sm:hidden">
              <div class="relative">
                <input type="text" value={searchTerm()} onInput={(e) => setSearchTerm(e.currentTarget.value)} placeholder="Buscar..." class="eq-input pr-10" />
                <button type="submit" class="absolute right-0 top-0 bottom-0 px-3 flex items-center eq-btn-ghost">
                  <Search size={18} />
                </button>
              </div>
            </form>
            {navLinks.map(link => (
              <button
                onClick={() => handleNav(link.path)}
                class="w-full text-left px-3 py-2.5 rounded text-sm font-medium eq-btn-ghost"
              >
                {link.label}
              </button>
            ))}
            {!auth.isAuthenticated() && (
              <div class="flex gap-2 pt-2 sm:hidden">
                <button onClick={() => handleNav('/login')} class="flex-1 eq-btn-outline eq-btn-sm">Entrar</button>
                <button onClick={() => handleNav('/register')} class="flex-1 eq-btn eq-btn-sm">Criar conta</button>
              </div>
            )}
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
    </>
  );
};

export default Navbar;
