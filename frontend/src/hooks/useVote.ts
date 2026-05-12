'use client';

import { useState, useCallback } from 'react';
import { votesApi } from '@/lib/api';
import { useIssueStore } from '@/store/issueStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

interface UseVoteReturn {
  isVoting: boolean;
  handleVote: (issueId: string, currentVoted: boolean) => Promise<void>;
}

export const useVote = (): UseVoteReturn => {
  const [isVoting, setIsVoting] = useState(false);
  const { updateIssueLocally, toggleVotedLocally } = useIssueStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleVote = useCallback(
    async (issueId: string, currentVoted: boolean) => {
      if (!isAuthenticated) {
        toast.error('Please login to vote on issues');
        router.push(ROUTES.LOGIN);
        return;
      }

      if (isVoting) return;

      // Optimistic update
      toggleVotedLocally(issueId);
      updateIssueLocally(issueId, {
        hasVoted: !currentVoted,
        votesCount: currentVoted ? 0 : 1, // Will be corrected by socket
      });

      setIsVoting(true);

      try {
        const response = await votesApi.toggle(issueId);
        const { voted, votesCount, priorityScore } = response.data.data;

        // Update with actual server values
        updateIssueLocally(issueId, {
          hasVoted: voted,
          votesCount,
          priorityScore,
        });

        if (voted) {
          toast.success('Vote added! 👍', { duration: 2000 });
        } else {
          toast('Vote removed', { icon: '👎', duration: 2000 });
        }
      } catch (err: unknown) {
        // Revert optimistic update on error
        toggleVotedLocally(issueId);
        updateIssueLocally(issueId, {
          hasVoted: currentVoted,
        });

        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        const message =
          axiosError.response?.data?.message || 'Failed to vote';
        toast.error(message);
      } finally {
        setIsVoting(false);
      }
    },
    [
      isAuthenticated,
      isVoting,
      router,
      toggleVotedLocally,
      updateIssueLocally,
    ]
  );

  return { isVoting, handleVote };
};