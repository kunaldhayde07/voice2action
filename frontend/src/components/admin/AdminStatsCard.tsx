'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  gradient?: boolean;
  delay?: number;
  suffix?: string;
  prefix?: string;
  onClick?: () => void;
}

export function AdminStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  gradient = false,
  delay = 0,
  suffix = '',
  prefix = '',
  onClick,
}: AdminStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'border transition-all duration-200',
        onClick && 'cursor-pointer',
        gradient
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent text-white'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-card hover:shadow-soft'
      )}
    >
      {/* Background decoration */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      )}

      <div className="relative">
        {/* Icon + Title */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              gradient ? 'bg-white/20' : iconBg
            )}
          >
            <Icon className={cn('w-6 h-6', gradient ? 'text-white' : iconColor)} />
          </div>

          {/* Trend badge */}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                gradient
                  ? 'bg-white/20 text-white'
                  : trend.direction === 'up'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : trend.direction === 'down'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          <p
            className={cn(
              'text-3xl font-black mb-1',
              gradient ? 'text-white' : 'text-gray-900 dark:text-white'
            )}
          >
            {prefix}
            {typeof value === 'number' ? formatNumber(value) : value}
            {suffix}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              gradient ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {title}
          </p>
          {subtitle && (
            <p
              className={cn(
                'text-xs mt-0.5',
                gradient ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs mt-1',
                gradient ? 'text-blue-200' : 'text-gray-400'
              )}
            >
              {trend.label}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}