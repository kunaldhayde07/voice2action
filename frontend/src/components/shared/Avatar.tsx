'use client';

import Image from 'next/image';
import { cn, getAvatarFallback, getImageUrl, getBadgeLevel, getBadgeConfig } from '@/lib/utils';
import { User } from '@/types';

interface AvatarProps {
  user?: Partial<User> | null;
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-6 h-6',   text: 'text-[10px]', badge: 'w-3 h-3 text-[6px]'  },
  sm: { container: 'w-8 h-8',   text: 'text-xs',     badge: 'w-4 h-4 text-[7px]'   },
  md: { container: 'w-10 h-10', text: 'text-sm',     badge: 'w-4 h-4 text-[8px]'   },
  lg: { container: 'w-12 h-12', text: 'text-base',   badge: 'w-5 h-5 text-[9px]'   },
  xl: { container: 'w-16 h-16', text: 'text-xl',     badge: 'w-6 h-6 text-[10px]'  },
};

const badgeEmoji: Record<string, string> = {
  bronze:   '🥉',
  silver:   '🥈',
  gold:     '🥇',
  platinum: '💎',
};

export function Avatar({
  user,
  src,
  name,
  size = 'md',
  showBadge = false,
  showOnline = false,
  className,
}: AvatarProps) {
  const { container, text, badge } = sizeMap[size];

  const imageSrc = src || (user?.avatar ? getImageUrl(user.avatar) : null);
  const displayName = name || user?.name || 'User';
  const fallback = getAvatarFallback(displayName);

  const reputationPoints = user?.reputationPoints ?? 0;
  const badgeLevel = getBadgeLevel(reputationPoints);
  const badgeCfg = getBadgeConfig(badgeLevel);

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          'bg-gradient-to-br from-blue-500 to-indigo-600',
          'ring-2 ring-white dark:ring-gray-800',
          container
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={displayName}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <span className={cn('font-semibold text-white select-none', text)}>
            {fallback}
          </span>
        )}
      </div>

      {/* Badge level indicator */}
      {showBadge && (
        <div
          className={cn(
            'absolute -bottom-1 -right-1 rounded-full flex items-center justify-center',
            'border-2 border-white dark:border-gray-800',
            badgeCfg.bg,
            badge
          )}
          title={`${badgeCfg.label} Member`}
        >
          <span>{badgeEmoji[badgeLevel]}</span>
        </div>
      )}

      {/* Online indicator */}
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-800" />
      )}
    </div>
  );
}