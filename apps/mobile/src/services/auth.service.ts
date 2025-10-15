import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/auth';

export class AuthService {
  /**
   * 회원가입
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    await this.saveTokens(response.data);
    return response.data;
  }

  /**
   * 로그인
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await this.saveTokens(response.data);
    return response.data;
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  static async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  /**
   * 토큰 저장
   */
  private static async saveTokens(data: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  }

  /**
   * 토큰 삭제
   */
  static async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * 저장된 사용자 정보 가져오기
   */
  static async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await SecureStore.getItemAsync('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  /**
   * 로그인 상태 확인
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }
}
