'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Social Login Button ──────────────────────────────────────────────────────

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full flex items-center justify-center gap-3',
        'px-4 py-3 rounded-xl',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-600',
        'text-gray-700 dark:text-gray-200 font-medium text-sm',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'transition-all duration-150',
        'shadow-sm hover:shadow-md'
      )}
    >
      {/* Google SVG */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </motion.button>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  error?: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({
  label,
  error,
  icon: Icon,
  rightElement,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        {children}
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { handleLogin, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await handleLogin(data.email, data.password);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    authApi.googleLogin();
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/8 border border-gray-100 dark:border-gray-700 p-8">
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30"
        >
          <Lock className="w-7 h-7 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sign in to your Voice2Action account
        </p>
      </div>

      {/* ── Global Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Google Login ── */}
      <div className="mb-5">
        <GoogleButton onClick={handleGoogleLogin} />
      </div>

      {/* ── Divider ── */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
            or continue with email
          </span>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <FormField label="Email address" error={errors.email?.message} icon={Mail}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isFormLoading}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl text-sm',
              'bg-gray-50 dark:bg-gray-700/50',
              'border transition-all duration-150',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'outline-none focus:ring-2 focus:ring-blue-500/20',
              errors.email
                ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                : emailValue && !errors.email
                ? 'border-green-300 dark:border-green-700 focus:border-green-400'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
            )}
          />
          {emailValue && !errors.email && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          )}
        </FormField>

        {/* Password */}
        <FormField
          label="Password"
          error={errors.password?.message}
          icon={Lock}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        >
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isFormLoading}
            className={cn(
              'w-full pl-10 pr-10 py-3 rounded-xl text-sm',
              'bg-gray-50 dark:bg-gray-700/50',
              'border transition-all duration-150',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'outline-none focus:ring-2 focus:ring-blue-500/20',
              errors.password
                ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                : passwordValue && !errors.password
                ? 'border-green-300 dark:border-green-700 focus:border-green-400'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
            )}
          />
        </FormField>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isFormLoading}
          whileHover={{ scale: isFormLoading ? 1 : 1.01 }}
          whileTap={{ scale: isFormLoading ? 1 : 0.99 }}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'px-4 py-3 rounded-xl',
            'bg-blue-600 hover:bg-blue-700',
            'text-white font-semibold text-sm',
            'shadow-md shadow-blue-500/25',
            'transition-all duration-150',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          )}
        >
          {isFormLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* ── Demo credentials ── */}
      <div className="mt-5 p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
          🚀 Demo Credentials
        </p>
        <div className="space-y-1">
          <p className="text-xs text-blue-600 dark:text-blue-300">
            <span className="font-medium">Citizen:</span> citizen@demo.com / Demo1234
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            <span className="font-medium">Admin:</span> admin@demo.com / Admin1234
          </p>
        </div>
      </div>

      {/* ── Register Link ── */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.REGISTER}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}