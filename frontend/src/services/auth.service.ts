import { api } from './api';
import {
  mapAuthResponse, mapUser,
  type BackendAuthResponse, type BackendUserDto, type BackendRegisterDto, type BackendLoginDto
} from './mappers';
import type { AuthResponse, RegisterDto, LoginDto, User } from '../types';

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const payload: BackendRegisterDto = {
      name: data.fullName,
      email: data.email,
      password: data.password,
    };
    const raw = await api.post<BackendAuthResponse>('/auth/register', payload);
    const response = mapAuthResponse(raw);
    api.setToken(response.token);
    return response;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const payload: BackendLoginDto = { email: data.email, password: data.password };
    const raw = await api.post<BackendAuthResponse>('/auth/login', payload);
    const response = mapAuthResponse(raw);
    api.setToken(response.token);
    return response;
  },

  logout(): void {
    api.clearToken();
    window.location.href = '/';
  },

  async getProfile(): Promise<User> {
    const raw = await api.get<BackendUserDto>('/auth/profile');
    return mapUser(raw);
  },

  async updateProfile(data: Partial<Pick<User, 'fullName' | 'bio' | 'avatarUrl'>>): Promise<User> {
    const payload: Record<string, unknown> = {};
    if (data.fullName) payload.name = data.fullName;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.avatarUrl !== undefined) payload.avatarUrl = data.avatarUrl;
    const raw = await api.put<BackendUserDto>('/auth/profile', payload);
    return mapUser(raw);
  },
};
