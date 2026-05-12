'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useIssueStore } from '@/store/issueStore';
import { IssueCard } from '@/components/issues/IssueCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/SkeletonCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { cn } from '@/lib/utils';
import { IssueStatus } from '@/types';
import { ROUTES, ISSUE_STATUSES } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

const STATUS_TABS: { label: string; value: IssueStatus | 'all'; icon: React.ElementType; color: string }[] = [
  { label: 'All',         value: 'all',         icon: FileText,     color: 'text-gray-500'   },
  { label: 'Pending',     value: 'pending',      icon: Clock,        color: 'text-gray-500'   },
  { label: 'In Progress', value: 'in_progress',  icon: TrendingUp,   color: 'text-yellow-500' },
  { label: 'Resolved',    value: 'resolved',     icon: CheckCircle2, color: 'text-green-500'  },
  { label: 'Rejected',    value: 'rejected',     icon: AlertCircle,  color: 'text-red-500'    },
];

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<IssueStatus | 'all'>('all');
  const { myIssues, myPagination, isLoading, fetchMyIssues } = useIssueStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyIssues(
      activeTab !== 'all' ? { status: activeTab } : undefined
    );
  }, [activeTab, fetchMyIssues]);

  const stats = [
    {
      label: 'Total Reported',
      value: user?.reportedIssuesCount ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Resolved',
      value: user?.resolvedIssuesCount ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Pending',
      value: myIssues.filter((i) => i.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'In Progress',
      value: myIssues.filter((i) => i.status === 'in_progress').length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        description="Track all the civic issues you've reported"
        icon={FileText}
        actions={
          <Link
            href={ROUTES.REPORT}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Report</span>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatsCard key={stat.label} {...stat} delay={idx * 0.07} />
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.value === 'all'
              ? myIssues.length
              : myIssues.filter((i) => i.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 justify-center',
                activeTab === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4',
                  activeTab === tab.value ? tab.color : ''
                )}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center',
                    activeTab === tab.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      {isLoading ? (
        <SkeletonList count={4} />
      ) : myIssues.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={
            activeTab === 'all'
              ? "You haven't reported any issues yet"
              : `No ${activeTab.replace('_', ' ')} issues`
          }
          description={
            activeTab === 'all'
              ? 'Start contributing to your community by reporting local civic issues.'
              : `You have no issues with status "${activeTab.replace('_', ' ')}".`
          }
          action={
            activeTab === 'all'
              ? {
                  label: 'Report Your First Issue',
                  onClick: () => (window.location.href = ROUTES.REPORT),
                  icon: Plus,
                }
              : undefined
          }
          secondaryAction={
            activeTab !== 'all'
              ? { label: 'View All', onClick: () => setActiveTab('all') }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myIssues.map((issue, idx) => (
            <motion.div
              key={issue._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <IssueCard issue={issue} showPriority />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {myPagination && myPagination.total > 0 && (
        <p className="text-center text-sm text-gray-400">
          Showing {myIssues.length} of {myPagination.total} issues
        </p>
      )}
    </div>
  );
}