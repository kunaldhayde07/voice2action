import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api';
import {
  disconnectSocket,
  initSocket,
  updateSocketAuth,
} from '@/lib/socket';
import { getErrorMessage } from '@/lib/utils';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Hydration
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, user: User) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Hydration
      hasHydrated: false,

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login({
            email,
            password,
          });

          const { user, accessToken } = response.data.data;

          // Save token
          localStorage.setItem('accessToken', accessToken);

          // Init socket
          initSocket(accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          const message =
            axiosError.response?.data?.message ||
            getErrorMessage(error);

          set({
            isLoading: false,
            error: message,
          });

          throw new Error(message);
        }
      },

      // Register
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register({
            name,
            email,
            password,
          });

          const { user, accessToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);

          initSocket(accessToken);

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          const message =
            axiosError.response?.data?.message ||
            getErrorMessage(error);

          set({
            isLoading: false,
            error: message,
          });

          throw new Error(message);
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore API logout failure
        } finally {
          localStorage.removeItem('accessToken');

          disconnectSocket();

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Set user
      setUser: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      // Set tokens
      setTokens: (accessToken, user) => {
        localStorage.setItem('accessToken', accessToken);

        updateSocketAuth(accessToken);

        set({
          accessToken,
          user,
          isAuthenticated: true,
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Refresh user
      refreshUser: async () => {
        try {
          const response = await authApi.getMe();

          const { user } = response.data.data;

          set({ user });
        } catch {
          // Silent fail
        }
      },

      // Update user locally
      updateUserLocally: (updates) => {
        const { user } = get();

        if (user) {
          set({
            user: {
              ...user,
              ...updates,
            },
          });
        }
      },
    }),

    // Persist Config
    {
      name: 'auth-storage',

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);