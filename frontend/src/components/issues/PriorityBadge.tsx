'use client';

import { Flame } from 'lucide-react';
import { cn, getPriorityLabel } from '@/lib/utils';

interface PriorityBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function PriorityBadge({
  score,
  showIcon = true,
  size = 'sm',
}: PriorityBadgeProps) {
  const { label, color, bg } = getPriorityLabel(score);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        bg,
        color
      )}
    >
      {showIcon && <Flame className="w-3 h-3" />}
      {score.toFixed(0)} · {label}
    </span>
  );
}