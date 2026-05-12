'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  suffix?: string;
  prefix?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  trendUp = true,
  delay = 0,
  suffix = '',
  prefix = '',
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="civic-card p-5 group cursor-default"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'transition-transform duration-200 group-hover:scale-110',
            bg
          )}
        >
          <Icon className={cn('w-5 h-5', color)} />
        </div>
      </div>

      <div>
        <motion.p
          className="text-2xl font-black text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
        >
          {prefix}
          {formatNumber(value)}
          {suffix}
        </motion.p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
          {label}
        </p>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 mt-2 text-[11px] font-medium',
              trendUp
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}