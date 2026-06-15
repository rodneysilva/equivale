export interface SocialLink {
  type: string;
  url: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  role: 'user' | 'admin';
  walletBalance: number;
  createdAt: string;
  updatedAt?: string;
  isBanned: boolean;
}

export interface UserCommunity {
  id: string;
  name: string;
  imageUrl?: string;
  membersCount: number;
  isOwner: boolean;
  isModerator: boolean;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
