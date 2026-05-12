'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/lib/constants';

export const useAuth = () => {
  const router = useRouter();

  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Hydration
    hasHydrated,

    login,
    register,
    logout,
    clearError,
    refreshUser,
    updateUserLocally,
  } = useAuthStore();

  // Login
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);

        toast.success('Welcome back! 👋');

        // Get updated user after login
        const { user } = useAuthStore.getState();

        // Redirect based on role
        if (
          user?.role === 'admin' ||
          user?.role === 'super_admin'
        ) {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Login failed';

        toast.error(message);

        throw err;
      }
    },
    [login, router]
  );

  // Register
  const handleRegister = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ) => {
      try {
        await register(name, email, password);

        toast.success(
          'Account created successfully! Welcome to Voice2Action 🎉'
        );

        router.push(ROUTES.DASHBOARD);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Registration failed';

        toast.error(message);

        throw err;
      }
    },
    [register, router]
  );

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();

      toast.success('Logged out successfully');

      router.push(ROUTES.HOME);
    } catch {
      toast.error('Logout failed');
    }
  }, [logout, router]);

  // Roles
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin';

  const isCitizen = user?.role === 'citizen';

  const isSuperAdmin =
    user?.role === 'super_admin';

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Hydration
    hasHydrated,

    // Roles
    isAdmin,
    isCitizen,
    isSuperAdmin,

    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    clearError,
    refreshUser,
    updateUserLocally,
  };
};