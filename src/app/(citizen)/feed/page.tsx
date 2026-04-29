'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import IssueCard from '@/components/issues/IssueCard';
import IssueDetail from '@/components/issues/IssueDetail';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ToastContainer from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { useIssues } from '@/hooks/useIssues';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Issue, IssueCategory, IssueStatus, WsMessage } from '@/types';
import { categoryLabels, categoryIcons } from '@/lib/utils';

const categories: IssueCategory[] = [
  'road', 'water', 'electricity', 'garbage', 'safety', 'parks', 'noise', 'other'
];

export default function FeedPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const {
    issues,
    loading,
    error,
    filters,
    pagination,
    updateFilter,
    updateIssueVoteCount,
    addNewIssue,
    updateIssueStatus,
    refetch,
  } = useIssues();

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'vote_update' && msg.issueId && msg.voteCount !== undefined) {
      updateIssueVoteCount(msg.issueId, msg.voteCount);
    }

    if (msg.type === 'new_issue' && msg.issue) {
      addNewIssue(msg.issue);
      addToast(`New issue reported: ${msg.issue.title.slice(0, 50)}`, 'info');
    }

    if (msg.type === 'status_update' && msg.issueId && msg.status) {
      updateIssueStatus(msg.issueId, msg.status as IssueStatus);
      addToast(`Issue status updated to ${msg.status.replace('_', ' ')}`, 'success');
    }
  }, [updateIssueVoteCount, addNewIssue, updateIssueStatus, addToast]);

  const { isConnected } = useWebSocket({ onMessage: handleWsMessage });

  return (
    <>
      <Navbar isConnected={isConnected} />

      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Issues Feed</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {pagination.total} issues reported ·{' '}
                <span className={`font-medium ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isConnected ? '● Live updates' : '○ Reconnecting...'}
                </span>
              </p>
            </div>

            <Button
              href="/report"
              as="a"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Report Issue
            </Button>
          </div>

          {/* filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-card">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* search */}
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  placeholder="Search issues..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
                />
              </div>

              {/* sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-400 outline-none text-sm text-slate-700 bg-white min-w-[140px]"
              >
                <option value="priority">By Priority</option>
                <option value="votes">By Votes</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* status */}
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-400 outline-none text-sm text-slate-700 bg-white min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* category pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => updateFilter('category', 'all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.category === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filters.category === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{categoryIcons[cat]}</span>
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* issues list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Loading issues...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-slate-700 font-medium">No issues found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {issues.map((issue, i) => (
                  <IssueCard
                    key={issue._id}
                    issue={issue}
                    index={i}
                    onClick={setSelectedIssue}
                    onVoteSuccess={(id, count) => updateIssueVoteCount(id, count)}
                  />
                ))}
              </AnimatePresence>

              {/* pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => refetch(pagination.page - 1)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => refetch(pagination.page + 1)}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* issue detail modal */}
      <Modal
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        size="lg"
      >
        {selectedIssue && (
          <IssueDetail
            issue={selectedIssue}
            onVoteSuccess={(count) => {
              updateIssueVoteCount(selectedIssue._id, count);
              setSelectedIssue(prev => prev ? { ...prev, voteCount: count, hasVoted: true } : null);
            }}
            onClose={() => setSelectedIssue(null)}
          />
        )}
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}