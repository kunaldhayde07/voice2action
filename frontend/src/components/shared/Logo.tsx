'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
  subtitle?: string;
}

const sizeConfig = {
  sm: { icon: 'w-8 h-8', iconInner: 'w-4 h-4', title: 'text-sm', subtitle: 'text-[10px]' },
  md: { icon: 'w-10 h-10', iconInner: 'w-5 h-5', title: 'text-base', subtitle: 'text-xs' },
  lg: { icon: 'w-14 h-14', iconInner: 'w-7 h-7', title: 'text-xl',  subtitle: 'text-sm' },
};

export function Logo({
  size = 'md',
  showText = true,
  className,
  href = '/',
  subtitle,
}: LogoProps) {
  const sizes = sizeConfig[size];

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={cn(
          'relative flex items-center justify-center rounded-xl',
          'bg-blue-600 shadow-lg shadow-blue-500/30',
          'flex-shrink-0',
          sizes.icon
        )}
      >
        {/* Grid icon (civic/government feel) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn('text-white', sizes.iconInner)}
        >
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9 22 9 12 15 12 15 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Live indicator dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </motion.div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              'font-bold text-gray-900 dark:text-white tracking-tight',
              sizes.title
            )}
          >
            Voice<span className="text-blue-600">2</span>Action
          </span>
          {subtitle && (
            <span
              className={cn(
                'text-gray-500 dark:text-gray-400 font-medium',
                sizes.subtitle
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="focus-visible:outline-none">
      {content}
    </Link>
  ) : (
    content
  );
}