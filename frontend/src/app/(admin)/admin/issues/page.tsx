'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Filter, Search, X } from 'lucide-react';
import { issuesApi, adminApi } from '@/lib/api';
import { Issue, IssueStatus } from '@/types';
import { IssueTable } from '@/components/admin/IssueTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '@/lib/constants';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

interface StatusUpdateData {
  issueId: string;
  newStatus: IssueStatus;
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    urgency: '',
    search: '',
  });
  const [confirmData, setConfirmData] = useState<StatusUpdateData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { searchValue, handleSearch, clearSearch } = useDebouncedSearch(
    (value) => setFilters((prev) => ({ ...prev, search: value })),
    400
  );

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.search) params.search = filters.search;

      const response = await issuesApi.getAll(params);
      setIssues(response.data.data.data);
      setTotal(response.data.data.pagination.total);
    } catch {
      toast.error('Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = (issueId: string, status: IssueStatus) => {
    setConfirmData({ issueId, newStatus: status });
  };

  const confirmStatusChange = async () => {
    if (!confirmData) return;
    setIsUpdating(true);
    try {
      await issuesApi.updateStatus(confirmData.issueId, {
        status: confirmData.newStatus,
      });
      toast.success(`Status updated to ${confirmData.newStatus.replace('_', ' ')}`);
      fetchIssues();
      setConfirmData(null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerify = async (issueId: string) => {
    try {
      await adminApi.verifyIssue(issueId);
      toast.success('Issue verified!');
      fetchIssues();
    } catch {
      toast.error('Failed to verify issue');
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Issue Moderation"
        description={`${total} total issues to manage`}
        icon={ShieldCheck}
        actions={
          <button
            onClick={fetchIssues}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="civic-card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => { setFilters((p) => ({ ...p, status: e.target.value })); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Statuses</option>
            {ISSUE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) => { setFilters((p) => ({ ...p, category: e.target.value })); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400 transition-colors"
          >
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={() => {
                setFilters({ status: '', category: '', urgency: '', search: '' });
                clearSearch();
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Status quick filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { setFilters((p) => ({ ...p, status: '' })); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors',
              !filters.status
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            All ({total})
          </button>
          {ISSUE_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setFilters((p) => ({ ...p, status: s.value })); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors',
                filters.status === s.value
                  ? s.color
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="civic-card overflow-hidden">
        <IssueTable
          issues={issues}
          onStatusChange={handleStatusChange}
          onVerify={handleVerify}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={confirmStatusChange}
        title="Update Issue Status"
        description={`Are you sure you want to change the status to "${confirmData?.newStatus?.replace('_', ' ')}"? This action will notify the issue reporter.`}
        confirmLabel="Yes, Update"
        variant={confirmData?.newStatus === 'rejected' ? 'danger' : 'info'}
        isLoading={isUpdating}
      />
    </div>
  );
}