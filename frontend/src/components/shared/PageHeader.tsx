'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  badge?: {
    label: string;
    color?: string;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  showBack = false,
  backLabel = 'Back',
  onBack,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-start justify-between gap-4 mb-6', className)}
    >
      <div className="flex items-start gap-4 min-w-0">
        {/* Back button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="mt-0.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        {Icon && (
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {/* Text */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {badge && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  badge.color || 'bg-blue-100 text-blue-700'
                )}
              >
                {badge.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}