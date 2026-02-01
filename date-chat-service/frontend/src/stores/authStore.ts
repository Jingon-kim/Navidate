import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  nickname: string;
  coupleId?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const user = response.user;
      localStorage.setItem('userId', user.id);
      set({ user, isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || '로그인에 실패했습니다.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  signup: async (email: string, password: string, nickname: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.signup(email, password, nickname);
      const user = response.user;
      localStorage.setItem('userId', user.id);
      set({ user, isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || '회원가입에 실패했습니다.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('userId');
    set({ user: null });
  },

  checkAuth: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      set({ user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authAPI.getMe();
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem('userId');
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
