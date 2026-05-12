'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { initSocket } from '@/lib/socket';
import { ROUTES } from '@/lib/constants';
import { User } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      setTimeout(() => {
        router.replace(`${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`);
      }, 2000);
      return;
    }

    if (!token || !userParam) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam)) as User;

      // Store auth data
      setTokens(token, user);
      localStorage.setItem('accessToken', token);

      // Initialize socket
      initSocket(token);

      // Redirect based on role
      const redirectTo =
        user.role === 'admin' || user.role === 'super_admin'
          ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.DASHBOARD;

      setTimeout(() => {
        router.replace(redirectTo);
      }, 1500);
    } catch {
      router.replace(ROUTES.LOGIN);
    }
  }, [searchParams, router, setTokens]);

  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 max-w-sm w-full text-center"
      >
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Google login failed. Redirecting you back...
            </p>
          </>
        ) : (
          <>
            {/* Animated success icon */}
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </motion.div>
              </div>
              <motion.span
                className="absolute inset-0 rounded-2xl bg-green-400 opacity-20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Login Successful! 🎉
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Welcome to Voice2Action. Redirecting to your dashboard...
            </p>

            {/* Loading dots */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ y: [-4, 4, -4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}