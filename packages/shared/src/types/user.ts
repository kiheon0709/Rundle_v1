export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  city?: string;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
