import { api } from './api';
import type { AuthResponse, RegisterDto, LoginDto, User } from '../types';

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    api.setToken(response.token);
    return response;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    api.setToken(response.token);
    return response;
  },

  logout(): void {
    api.clearToken();
    window.location.href = '/';
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/auth/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>('/auth/profile', data);
  },
};
