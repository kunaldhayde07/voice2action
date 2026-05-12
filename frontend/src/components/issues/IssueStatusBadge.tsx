'use client';

import { cn, getStatusConfig, getUrgencyConfig } from '@/lib/utils';
import { IssueStatus, UrgencyLevel } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function IssueStatusBadge({
  status,
  size = 'md',
  showDot = true,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.color
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            config.dot
          )}
        />
      )}
      {config.label}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  size?: 'sm' | 'md';
}

export function UrgencyBadge({ urgency, size = 'md' }: UrgencyBadgeProps) {
  const config = getUrgencyConfig(urgency);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.color
      )}
    >
      {urgency === 'critical' ? '🚨 ' : urgency === 'high' ? '🔴 ' : urgency === 'medium' ? '🟡 ' : '🟢 '}
      {config.label}
    </span>
  );
}