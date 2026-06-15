import { createContext, useContext } from 'solid-js';
import { createSignal, createEffect } from 'solid-js';
import type { User, RegisterDto, LoginDto } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  currentUser: () => User | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  error: () => string | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: { fullName?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>();

export function AuthProvider(props: { children: any }) {
  const [currentUser, setCurrentUser] = createSignal<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const clearError = () => setError(null);

  const loadProfile = async () => {
    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch {
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(() => {
    loadProfile();
  });

  const login = async (data: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { fullName?: string; bio?: string; avatarUrl?: string }) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(data);
      setCurrentUser(updated);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
      throw err;
    }
  };

  const logout = () => {
    authService.logout().catch(() => {});
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const user = await authService.getProfile();
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch { /* ignore */ }
  };

  const state: AuthState = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={state}>{props.children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
