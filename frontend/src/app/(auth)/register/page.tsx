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
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

// ─── Validation Schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password Strength ────────────────────────────────────────────────────────

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number',           valid: /[0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.valid).length;

  const strengthConfig = [
    { label: '',         color: 'bg-gray-200 dark:bg-gray-700' },
    { label: 'Weak',     color: 'bg-red-500'    },
    { label: 'Fair',     color: 'bg-orange-500' },
    { label: 'Good',     color: 'bg-yellow-500' },
    { label: 'Strong',   color: 'bg-green-500'  },
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 overflow-hidden"
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: i <= strength ? '100%' : '0%' }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={cn('h-full rounded-full transition-all', strengthConfig[strength]?.color)}
            />
          </motion.div>
        ))}
      </div>

      {strength > 0 && (
        <p className={cn(
          'text-xs font-medium',
          strength === 1 ? 'text-red-600'    :
          strength === 2 ? 'text-orange-600' :
          strength === 3 ? 'text-yellow-600' :
          'text-green-600'
        )}>
          {strengthConfig[strength]?.label} password
        </p>
      )}

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <div
            key={check.label}
            className={cn(
              'flex items-center gap-1.5 text-[11px]',
              check.valid
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <div
              className={cn(
                'w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0',
                check.valid
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              {check.valid && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            {check.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Benefits List ────────────────────────────────────────────────────────────

const BENEFITS = [
  '📍 Report local civic issues instantly',
  '🗳️ Vote on issues that matter to you',
  '🏆 Earn reputation points & badges',
  '🔔 Get real-time status updates',
  '🗺️ View issues on interactive map',
];

// ─── Register Page ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { handleRegister, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  const nameValue = watch('name');
  const emailValue = watch('email');

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await handleRegister(data.name, data.email, data.password);
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="space-y-4">
      {/* ── Main Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/8 border border-gray-100 dark:border-gray-700 p-8">

        {/* Header */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30"
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Join thousands of citizens making a difference
          </p>
        </div>

        {/* Global Error */}
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

        {/* Google */}
        <div className="mb-5">
          <motion.button
            type="button"
            onClick={() => authApi.googleLogin()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              'w-full flex items-center justify-center gap-3',
              'px-4 py-3 rounded-xl',
              'bg-white dark:bg-gray-700',
              'border border-gray-200 dark:border-gray-600',
              'text-gray-700 dark:text-gray-200 font-medium text-sm',
              'hover:bg-gray-50 dark:hover:bg-gray-600',
              'transition-all duration-150 shadow-sm hover:shadow-md'
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
              or register with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                disabled={isFormLoading}
                className={cn(
                  'w-full pl-10 pr-10 py-3 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-700/50',
                  'border transition-all duration-150',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'outline-none focus:ring-2 focus:ring-blue-500/20',
                  errors.name
                    ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                    : nameValue && !errors.name
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
                )}
              />
              {nameValue && !errors.name && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isFormLoading}
                className={cn(
                  'w-full pl-10 pr-10 py-3 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-700/50',
                  'border transition-all duration-150',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'outline-none focus:ring-2 focus:ring-blue-500/20',
                  errors.email
                    ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                    : emailValue && !errors.email
                    ? 'border-green-300 dark:border-green-700'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
                )}
              />
              {emailValue && !errors.email && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isFormLoading}
                className={cn(
                  'w-full pl-10 pr-10 py-3 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-700/50',
                  'border transition-all duration-150',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'outline-none focus:ring-2 focus:ring-blue-500/20',
                  errors.password
                    ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Password Strength Meter */}
            <AnimatePresence>
              {passwordValue && <PasswordStrength password={passwordValue} />}
            </AnimatePresence>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isFormLoading}
                className={cn(
                  'w-full pl-10 pr-10 py-3 rounded-xl text-sm',
                  'bg-gray-50 dark:bg-gray-700/50',
                  'border transition-all duration-150',
                  'text-gray-900 dark:text-white placeholder:text-gray-400',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'outline-none focus:ring-2 focus:ring-blue-500/20',
                  errors.confirmPassword
                    ? 'border-red-300 dark:border-red-700 focus:border-red-400'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-400'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <button type="button" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Privacy Policy
            </button>
            .
          </p>

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
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
          >
            Sign in instead
          </Link>
        </p>
      </div>

      {/* ── Benefits Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
      >
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          What you&apos;ll get
        </p>
        <div className="space-y-2">
          {BENEFITS.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              {benefit}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}