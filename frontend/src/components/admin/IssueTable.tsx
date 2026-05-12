'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { Issue, IssueStatus } from '@/types';
import { IssueStatusBadge, UrgencyBadge } from '@/components/issues/IssueStatusBadge';
import { PriorityBadge } from '@/components/issues/PriorityBadge';
import { Avatar } from '@/components/shared/Avatar';
import { cn, timeAgo, truncate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface IssueTableProps {
  issues: Issue[];
  onStatusChange: (issueId: string, status: IssueStatus) => void;
  onVerify: (issueId: string) => void;
  isLoading?: boolean;
}

type SortKey = 'priorityScore' | 'votesCount' | 'createdAt' | 'status';

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

function ActionMenu({
  issue,
  onStatusChange,
  onVerify,
  onClose,
}: {
  issue: Issue;
  onStatusChange: (id: string, status: IssueStatus) => void;
  onVerify: (id: string) => void;
  onClose: () => void;
}) {
  const NEXT_STATUSES: Record<string, { label: string; status: IssueStatus; icon: React.ElementType; color: string }[]> = {
    pending: [
      { label: 'Review',     status: 'under_review', icon: Eye,          color: 'text-blue-600'   },
      { label: 'In Progress',status: 'in_progress',  icon: CheckCircle2, color: 'text-yellow-600' },
      { label: 'Resolve',    status: 'resolved',     icon: CheckCircle2, color: 'text-green-600'  },
      { label: 'Reject',     status: 'rejected',     icon: XCircle,      color: 'text-red-600'    },
    ],
    under_review: [
      { label: 'In Progress', status: 'in_progress', icon: CheckCircle2, color: 'text-yellow-600' },
      { label: 'Resolve',     status: 'resolved',    icon: CheckCircle2, color: 'text-green-600'  },
      { label: 'Reject',      status: 'rejected',    icon: XCircle,      color: 'text-red-600'    },
    ],
    in_progress: [
      { label: 'Resolve', status: 'resolved', icon: CheckCircle2, color: 'text-green-600' },
      { label: 'Reject',  status: 'rejected', icon: XCircle,      color: 'text-red-600'   },
    ],
    resolved: [],
    rejected: [
      { label: 'Reopen', status: 'pending', icon: CheckCircle2, color: 'text-blue-600' },
    ],
    duplicate: [],
  };

  const actions = NEXT_STATUSES[issue.status] || [];

  return (
    <div
      className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {!issue.isVerified && (
        <button
          onClick={() => { onVerify(issue._id); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Verify Issue
        </button>
      )}

      {actions.length > 0 && (
        <>
          {!issue.isVerified && <div className="border-t border-gray-100 dark:border-gray-700" />}
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.status}
                onClick={() => { onStatusChange(issue._id, action.status); onClose(); }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  action.color
                )}
              >
                <ActionIcon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </>
      )}

      <div className="border-t border-gray-100 dark:border-gray-700">
        <Link
          href={`${ROUTES.ISSUES}/${issue._id}`}
          target="_blank"
          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={onClose}
        >
          <ExternalLink className="w-4 h-4" />
          View Details
        </Link>
      </div>
    </div>
  );
}

export function IssueTable({
  issues,
  onStatusChange,
  onVerify,
  isLoading,
}: IssueTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'priorityScore',
    direction: 'desc',
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' }
    );
  };

  const sortedIssues = [...issues].sort((a, b) => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;
    switch (sortConfig.key) {
      case 'priorityScore': return (a.priorityScore - b.priorityScore) * dir;
      case 'votesCount':    return (a.votesCount - b.votesCount) * dir;
      case 'createdAt':     return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case 'status':        return a.status.localeCompare(b.status) * dir;
      default:              return 0;
    }
  });

  const SortIcon = ({ colKey }: { colKey: SortKey }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp
        className={cn(
          'w-3 h-3 -mb-1',
          sortConfig.key === colKey && sortConfig.direction === 'asc'
            ? 'text-blue-600'
            : 'text-gray-300 dark:text-gray-600'
        )}
      />
      <ChevronDown
        className={cn(
          'w-3 h-3',
          sortConfig.key === colKey && sortConfig.direction === 'desc'
            ? 'text-blue-600'
            : 'text-gray-300 dark:text-gray-600'
        )}
      />
    </span>
  );

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              {['Issue', 'Status', 'Priority', 'Votes', 'Reporter', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Issue
            </th>
            {(['status', 'priorityScore', 'votesCount'] as SortKey[]).map((key) => (
              <th
                key={key}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                onClick={() => handleSort(key)}
              >
                <div className="flex items-center">
                  {key === 'priorityScore' ? 'Priority' : key === 'votesCount' ? 'Votes' : 'Status'}
                  <SortIcon colKey={key} />
                </div>
              </th>
            ))}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reporter
            </th>
            <th
              className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center">
                Date
                <SortIcon colKey="createdAt" />
              </div>
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {sortedIssues.map((issue, idx) => (
            <motion.tr
              key={issue._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              {/* Issue title + category */}
              <td className="px-4 py-3 max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`${ROUTES.ISSUES}/${issue._id}`}
                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition-colors"
                    >
                      {issue.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 truncate">
                        {issue.category}
                      </span>
                      {issue.isVerified && (
                        <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      📍 {truncate(issue.address, 35)}
                    </p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <IssueStatusBadge status={issue.status} size="sm" />
              </td>

              {/* Priority */}
              <td className="px-4 py-3">
                <PriorityBadge score={issue.priorityScore} size="sm" />
              </td>

              {/* Votes */}
              <td className="px-4 py-3">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {issue.votesCount}
                </span>
              </td>

              {/* Reporter */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={issue.createdBy?.avatar}
                    name={issue.createdBy?.name}
                    size="xs"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                    {issue.createdBy?.name}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="px-4 py-3">
                <span className="text-xs text-gray-400">
                  {timeAgo(issue.createdAt)}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(
                      activeMenu === issue._id ? null : issue._id
                    );
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {activeMenu === issue._id && (
                  <ActionMenu
                    issue={issue}
                    onStatusChange={onStatusChange}
                    onVerify={onVerify}
                    onClose={() => setActiveMenu(null)}
                  />
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {issues.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No issues found
        </div>
      )}
    </div>
  );
}