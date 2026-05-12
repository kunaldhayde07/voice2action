'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  ThumbsUp,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
} from 'lucide-react';

import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useSocket } from '@/hooks/useSocket';

import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { CategoryChart } from '@/components/admin/CategoryChart';
import { TrendChart } from '@/components/admin/TrendChart';
import { StatusChart } from '@/components/admin/StatusChart';

import { IssueCard } from '@/components/issues/IssueCard';

import { PageHeader } from '@/components/shared/PageHeader';
import {
  SkeletonList,
  StatsCardSkeleton,
} from '@/components/shared/SkeletonCard';

import { adminApi } from '@/lib/api';

import { IssueStatus } from '@/types';

import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  // Auth hydration fix
  const {
    hasHydrated,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  // Dashboard analytics
  const {
    dashboardData,
    isLoading,
    refreshDashboard,
  } = useAdminAnalytics();

  // Real-time socket
  useSocket();

  /**
   * Prevent hydration mismatch
   * Wait until Zustand persist restores auth state
   */
  if (!hasHydrated) {
    return null;
  }

  /**
   * Optional security layer
   * Avoid rendering admin dashboard
   * before auth becomes valid
   */
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Handle status update
  const handleStatusChange = async (
    issueId: string,
    status: IssueStatus
  ) => {
    try {
      await adminApi.getDashboard();

      toast.success(
        `Issue status updated to ${status.replace('_', ' ')}`
      );

      refreshDashboard();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Handle issue verification
  const handleVerify = async (issueId: string) => {
    try {
      await adminApi.verifyIssue(issueId);

      toast.success('Issue verified!');

      refreshDashboard();
    } catch {
      toast.error('Failed to verify issue');
    }
  };

  const stats = dashboardData?.stats;

  const STAT_CARDS = [
    {
      title: 'Total Issues',
      value: stats?.totalIssues ?? 0,
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: true,
      trend: {
        value: 12,
        label: 'vs last month',
        direction: 'up' as const,
      },
    },
    {
      title: 'Resolved',
      value: stats?.resolvedIssues ?? 0,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      trend: {
        value: 8,
        label: 'vs last month',
        direction: 'up' as const,
      },
    },
    {
      title: 'Pending Review',
      value: stats?.pendingIssues ?? 0,
      icon: Clock,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
      trend: {
        value: 3,
        label: 'vs last month',
        direction: 'down' as const,
      },
    },
    {
      title: 'In Progress',
      value: stats?.inProgressIssues ?? 0,
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Citizens',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      trend: {
        value: 24,
        label: 'new this month',
        direction: 'up' as const,
      },
    },
    {
      title: 'Total Votes',
      value: stats?.totalVotes ?? 0,
      icon: ThumbsUp,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      title: 'Resolution Rate',
      value: stats?.resolutionRate ?? 0,
      suffix: '%',
      icon: Target,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      title: 'Avg Resolution',
      value: stats?.avgResolutionDays ?? 0,
      suffix: ' days',
      icon: Zap,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Real-time overview of civic issue management"
        icon={BarChart3}
        badge={{
          label: 'Live',
          color: 'bg-green-100 text-green-700',
        }}
        actions={
          <button
            onClick={refreshDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))
          : STAT_CARDS.map((card, idx) => (
              <AdminStatsCard
                key={card.title}
                {...card}
                delay={idx * 0.06}
              />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 civic-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Issue Trend (Last 30 Days)
            </h3>
          </div>

          <TrendChart
            data={
              dashboardData?.monthlyTrend?.map((m) => ({
                _id: `${m._id.year}-${String(
                  m._id.month
                ).padStart(2, '0')}-01`,
                count: m.count,
                resolved: m.resolved,
              })) ?? []
            }
            isLoading={isLoading}
          />
        </div>

        <div className="civic-card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            By Status
          </h3>

          <StatusChart
            data={
              dashboardData?.resolutionRateData?.map((d) => ({
                _id: d._id as IssueStatus,
                count: d.count,
              })) ?? []
            }
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="civic-card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Issues by Category
          </h3>

          <CategoryChart
            data={dashboardData?.categoryStats ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="civic-card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Submissions
          </h3>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : (
            <div className="space-y-3">
              {dashboardData?.recentIssues?.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}