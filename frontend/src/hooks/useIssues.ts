'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useIssueStore } from '@/store/issueStore';
import { votesApi } from '@/lib/api';
import { IssueFilters } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface UseIssuesOptions {
  autoFetch?: boolean;
  initialFilters?: IssueFilters;
}

export const useIssues = (options: UseIssuesOptions = {}): any => {
  const { autoFetch = true, initialFilters } = options;
  const hasFetched = useRef(false);

  const {
    issues,
    myIssues,
    pagination,
    myPagination,
    filters,
    isLoading,
    isLoadingMore,
    error,
    votedIssueIds,
    mapIssues,
    fetchIssues,
    fetchMyIssues,
    fetchMapIssues,
    setFilters,
    resetFilters,
    setSelectedIssue,
    setVotedIssues,
    clearError,
  } = useIssueStore();

  const { isAuthenticated } = useAuthStore();

  // Fetch issues on mount
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      fetchIssues(initialFilters);
    }
  }, [autoFetch, fetchIssues, initialFilters]);

  // Fetch voted issues for the user
  useEffect(() => {
    if (isAuthenticated) {
      votesApi
        .getMyVotes()
        .then((res) => {
          const ids: string[] = res.data.data.votedIssueIds;
          setVotedIssues(ids);
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [isAuthenticated, setVotedIssues]);

  const applyFilters = useCallback(
    (newFilters: Partial<IssueFilters>) => {
      setFilters(newFilters);
      fetchIssues({ ...filters, ...newFilters, page: 1 });
    },
    [setFilters, fetchIssues, filters]
  );

  const loadMore = useCallback(() => {
    if (!pagination?.hasNext || isLoadingMore) return;
    fetchIssues({ ...filters, page: (pagination?.page ?? 1) + 1 }, true);
  }, [pagination, isLoadingMore, fetchIssues, filters]);

  const refresh = useCallback(() => {
    hasFetched.current = false;
    fetchIssues({ ...filters, page: 1 });
  }, [fetchIssues, filters]);

  const hasVoted = useCallback(
    (issueId: string): boolean => votedIssueIds.has(issueId),
    [votedIssueIds]
  );

  return {
    issues,
    myIssues,
    fetchIssues,
    pagination,
    myPagination,
    filters,
    isLoading,
    isLoadingMore,
    error,
    mapIssues,
    applyFilters,
    loadMore,
    refresh,
    resetFilters,
    setSelectedIssue,
    fetchMyIssues,
    fetchMapIssues,
    clearError,
    hasVoted,
    canLoadMore: pagination?.hasNext ?? false,
  };
};