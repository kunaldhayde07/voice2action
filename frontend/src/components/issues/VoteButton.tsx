'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useVote } from '@/hooks/useVote';

interface VoteButtonProps {
  issueId: string;
  votesCount: number;
  hasVoted: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export function VoteButton({
  issueId,
  votesCount,
  hasVoted,
  disabled = false,
  size = 'md',
  showCount = true,
}: VoteButtonProps) {
  const { isVoting, handleVote } = useVote();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && !isVoting) {
      handleVote(issueId, hasVoted);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isVoting}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={cn(
        'flex items-center gap-1.5 rounded-xl font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        hasVoted
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
      )}
      aria-label={hasVoted ? 'Remove vote' : 'Add vote'}
      aria-pressed={hasVoted}
    >
      <motion.div
        animate={isVoting ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5, repeat: isVoting ? Infinity : 0 }}
      >
        <ThumbsUp
          className={cn(
            'flex-shrink-0',
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          )}
        />
      </motion.div>

      {showCount && (
        <AnimatePresence mode="wait">
          <motion.span
            key={votesCount}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            {formatNumber(votesCount)}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
}