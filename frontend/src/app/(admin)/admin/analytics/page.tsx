'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, MapPin, Users, Eye, ThumbsUp, MessageSquare } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { CategoryChart } from '@/components/admin/CategoryChart';
import { TrendChart } from '@/components/admin/TrendChart';
import { StatusChart } from '@/components/admin/StatusChart';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn, formatNumber } from '@/lib/utils';

const PERIODS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function AdminAnalyticsPage() {
  const {
    analyticsData,
    isAnalyticsLoading,
    analyticsPeriod,
    setAnalyticsPeriod,
    refreshAnalytics,
  } = useAdminAnalytics();

  const engagement = analyticsData?.engagementStats ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep insights into civic engagement and issue resolution"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setAnalyticsPeriod(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  analyticsPeriod === p.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Engagement Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Votes',    value: engagement.totalVotes    ?? 0, icon: ThumbsUp,      iconColor: 'text-blue-600',   iconBg: 'bg-blue-50 dark:bg-blue-900/20'   },
          { title: 'Total Comments', value: engagement.totalComments ?? 0, icon: MessageSquare, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20'},
          { title: 'Total Views',    value: engagement.totalViews    ?? 0, icon: Eye,           iconColor: 'text-teal-600',   iconBg: 'bg-teal-50 dark:bg-teal-900/20'   },
          { title: 'Avg Priority',   value: Math.round(engagement.avgPriorityScore ?? 0), icon: TrendingUp, iconColor: 'text-orange-600', iconBg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((card, idx) => (
          <AdminStatsCard key={card.title} {...card} delay={idx * 0.07} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="civic-card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Daily Issue Trend
          </h3>
          <TrendChart
            data={analyticsData?.dailyIssues ?? []}
            isLoading={isAnalyticsLoading}
          />
        </div>

        <div className="civic-card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Issues by Status
          </h3>
          <StatusChart
            data={analyticsData?.issuesByStatus ?? []}
            isLoading={isAnalyticsLoading}
          />
        </div>
      </div>

      {/* Category chart */}
      <div className="civic-card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Issues by Category (Reported vs Resolved)
        </h3>
        <CategoryChart
          data={analyticsData?.issuesByCategory ?? []}
          isLoading={isAnalyticsLoading}
        />
      </div>

      {/* Top areas */}
      <div className="civic-card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          Most Affected Areas
        </h3>
        {isAnalyticsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(analyticsData?.topAreas ?? []).map((area, idx) => {
              const maxCount = analyticsData?.topAreas?.[0]?.count ?? 1;
              const pct = Math.round((area.count / maxCount) * 100);
              return (
                <motion.div
                  key={area._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  )}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {area._id || 'Unknown Area'}
                      </p>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-400">
                          avg {area.avgVotes.toFixed(1)} votes
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {area.count}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + idx * 0.05, duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {(analyticsData?.topAreas ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No area data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}