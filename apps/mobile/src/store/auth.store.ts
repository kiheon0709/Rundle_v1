import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';
import { AuthService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  /**
   * 로그인
   */
  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '로그인에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 회원가입
   */
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '회원가입에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // 로그아웃은 에러가 나도 로컬 상태 초기화
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * 인증 상태 확인 (앱 시작시)
   */
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        // 저장된 사용자 정보 가져오기
        const user = await AuthService.getStoredUser();

        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // 사용자 정보가 없으면 서버에서 다시 가져오기
          try {
            const userData = await AuthService.getMe();
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // 실패하면 로그아웃 처리
            await AuthService.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * 에러 초기화
   */
  clearError: () => set({ error: null }),
}));
