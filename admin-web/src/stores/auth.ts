import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { ADMIN_TOKEN_KEY } from '../services/api';
import type { UserInfo } from '../services/auth';
import * as authApi from '../services/auth';

const adminTokenStorage: StateStorage = {
  getItem: (name) => {
    void name;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      return null;
    }
    return JSON.stringify({ state: { token }, version: 0 });
  },
  setItem: (name, value) => {
    void name;
    try {
      const parsed = JSON.parse(value) as { state?: { token?: string | null } };
      const t = parsed.state?.token;
      if (t) {
        localStorage.setItem(ADMIN_TOKEN_KEY, t);
      } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },
  removeItem: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: async (phone, password) => {
        const tokens = await authApi.login(phone, password);
        localStorage.setItem(ADMIN_TOKEN_KEY, tokens.access_token);
        set({ token: tokens.access_token, isLoggedIn: true });
        const user = await authApi.getMe();
        set({ user });
      },

      logout: () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        set({ token: null, user: null, isLoggedIn: false });
      },

      loadUser: async () => {
        const token = get().token ?? localStorage.getItem(ADMIN_TOKEN_KEY);
        if (!token) {
          set({ token: null, user: null, isLoggedIn: false });
          return;
        }
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        set({ token, isLoggedIn: true });
        const user = await authApi.getMe();
        set({ user });
      },
    }),
    {
      name: 'admin-auth',
      storage: createJSONStorage(() => adminTokenStorage),
      partialize: (state) => ({ token: state.token }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<Pick<AuthState, 'token'>> | null | undefined;
        const token = p?.token ?? null;
        return {
          ...currentState,
          token,
          isLoggedIn: !!token,
        };
      },
    },
  ),
);
