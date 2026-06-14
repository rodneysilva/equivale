import { createSignal, type Component } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { Menu, X, Wallet, User, LogOut, Shield, ChevronDown } from 'lucide-solid';
import { useAuth } from '../../store/auth';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { path: '/', label: 'Início' },
  { path: '/products', label: 'Produtos' },
  { path: '/services', label: 'Serviços' },
  { path: '/communities', label: 'Comunidades' },
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
      <nav class="fixed top-0 left-0 right-0 z-50 liquid-nav">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNav('/')}
              class="text-2xl font-bold gradient-text cursor-pointer"
            >
              equivale
            </button>

            {/* Desktop Nav Links */}
            <div class="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  onClick={() => handleNav(link.path)}
                  class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location.pathname === link.path
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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
                  {/* Wallet badge */}
                  <button
                    onClick={() => handleNav('/wallet')}
                    class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <Wallet size={16} />
                    <span>{auth.currentUser()!.walletBalance} EQL</span>
                  </button>

                  {/* User dropdown */}
                  <div class="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen())}
                      class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {(auth.currentUser()!.fullName || auth.currentUser()!.username)[0].toUpperCase()}
                      </div>
                      <ChevronDown size={14} class="text-gray-500 hidden sm:block" />
                    </button>

                    {dropdownOpen() && (
                      <div class="absolute right-0 top-full mt-2 w-48 glass-card p-2 z-50">
                        <button
                          onClick={() => { handleNav('/profile'); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User size={16} /> Perfil
                        </button>
                        <button
                          onClick={() => { handleNav('/wallet'); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Wallet size={16} /> Carteira
                        </button>
                        {auth.currentUser()!.role === 'admin' && (
                          <button
                            onClick={() => { handleNav('/admin'); setDropdownOpen(false); }}
                            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Shield size={16} /> Admin
                          </button>
                        )}
                        <hr class="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={() => { auth.logout(); setDropdownOpen(false); }}
                          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} /> Sair
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
                    class="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    class="liquid-button text-sm px-4 py-2"
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen())}
                class="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileOpen() ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen() && (
        <div class="fixed inset-0 z-40 md:hidden">
          <div class="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div class="absolute top-16 left-0 right-0 liquid-nav p-4 space-y-1">
            {navLinks.map(link => (
              <button
                onClick={() => handleNav(link.path)}
                class={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            {auth.isAuthenticated() && (
              <>
                <button
                  onClick={() => handleNav('/wallet')}
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Wallet size={16} /> Carteira ({auth.currentUser()!.walletBalance} EQL)
                </button>
                <button
                  onClick={() => handleNav('/profile')}
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <User size={16} /> Perfil
                </button>
                <button
                  onClick={() => { auth.logout(); setMobileOpen(false); }}
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} /> Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div class="h-16" />
    </>
  );
};

export default Navbar;
