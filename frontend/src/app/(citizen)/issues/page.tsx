'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { useSocket } from '@/hooks/useSocket';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueFilters } from '@/components/issues/IssueFilters';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/SkeletonCard';
import { IssueFilters as IssueFiltersType } from '@/types';

export default function IssueFeedPage() {
  const {
    issues,
    pagination,
    filters,
    isLoading,
    isLoadingMore,
    error,
    applyFilters,
    loadMore,
    refresh,
    resetFilters,
    canLoadMore,
  } = useIssues({ autoFetch: true });

  useSocket();

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: canLoadMore,
    isLoading: isLoadingMore,
  });

  const handleFilterChange = useCallback(
    (newFilters: Partial<IssueFiltersType>) => {
      applyFilters(newFilters);
    },
    [applyFilters]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Issue Feed"
        description="Browse, vote, and track civic issues in your community"
        icon={AlertCircle}
        actions={
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      {/* Filters */}
      <IssueFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        resultCount={pagination?.total}
      />

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={refresh}
            className="text-red-600 hover:text-red-700 font-medium underline text-xs"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Issue List */}
      {isLoading ? (
        <SkeletonList count={6} />
      ) : issues.length === 0 ? (
        <EmptyState
          emoji="🏙️"
          title="No issues found"
          description={
            filters.search || filters.category || filters.status || filters.urgency
              ? 'Try adjusting your filters to find more issues.'
              : 'Be the first to report a civic issue in your community!'
          }
          action={{
            label: 'Report First Issue',
            onClick: () => window.location.href = '/report',
          }}
          secondaryAction={
            filters.search || filters.category || filters.status
              ? { label: 'Clear Filters', onClick: resetFilters }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map((issue: any, idx: number) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Loading more issues...
              </div>
            </div>
          )}

          {/* End of list */}
          {!canLoadMore && issues.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-500 dark:text-gray-400">
                ✅ You&apos;ve seen all {pagination?.total} issues
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}