'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Map,
  ArrowRight,
  Flame,
  Award,
  ThumbsUp,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import { useSocket } from '@/hooks/useSocket';
import { issuesApi, usersApi } from '@/lib/api';
import { IssueCard } from '@/components/issues/IssueCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SkeletonList, StatsCardSkeleton } from '@/components/shared/SkeletonCard';
import { LeaderboardEntry } from '@/types';
import { cn, getBadgeLevel, getBadgeConfig, formatNumber } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Avatar } from '@/components/shared/Avatar';

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Report Issue',
    description: 'Submit a new civic issue',
    icon: Plus,
    href: ROUTES.REPORT,
    color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25',
    iconBg: 'bg-white/20',
  },
  {
    label: 'View Map',
    description: 'See issues on the map',
    icon: Map,
    href: ROUTES.MAP,
    color: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    label: 'Issue Feed',
    description: 'Browse & vote on issues',
    icon: AlertCircle,
    href: ROUTES.ISSUES,
    color: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    label: 'My Reports',
    description: 'Track your submissions',
    icon: FileText,
    href: ROUTES.MY_REPORTS,
    color: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
];

// ─── Leaderboard Card ─────────────────────────────────────────────────────────

function LeaderboardCard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="civic-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Top Contributors
          </h3>
        </div>
        <span className="text-xs text-gray-400">This month</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, idx) => {
          const badgeLevel = getBadgeLevel(entry.reputationPoints);
          const badgeCfg = getBadgeConfig(badgeLevel);

          return (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="flex items-center gap-3"
            >
              {/* Rank */}
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  idx === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : idx === 1
                    ? 'bg-gray-100 text-gray-600'
                    : idx === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-50 text-gray-400'
                )}
              >
                {idx + 1}
              </div>

              {/* Avatar */}
              <Avatar
                src={entry.avatar}
                name={entry.name}
                size="sm"
              />

              {/* Name + badge */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {entry.name}
                </p>
                <span
                  className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                    badgeCfg.bg,
                    badgeCfg.color
                  )}
                >
                  {badgeCfg.label}
                </span>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-blue-600">
                  {formatNumber(entry.reputationPoints)}
                </p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No contributors yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─── User Stats Banner ────────────────────────────────────────────────────────

function UserStatsBanner() {
  const { user } = useAuth();
  if (!user) return null;

  const badgeLevel = getBadgeLevel(user.reputationPoints);
  const badgeCfg = getBadgeConfig(badgeLevel);
  const nextLevel =
    badgeLevel === 'bronze'
      ? 100
      : badgeLevel === 'silver'
      ? 200
      : badgeLevel === 'gold'
      ? 500
      : 500;
  const progress = Math.min((user.reputationPoints / nextLevel) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="civic-card p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar user={user} size="lg" showBadge />
          <div>
            <p className="text-blue-100 text-sm">Welcome back,</p>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  'bg-white/20 text-white'
                )}
              >
                {badgeCfg.label} Member
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Flame className="w-4 h-4 text-orange-300" />
            <span className="text-2xl font-black">
              {user.reputationPoints.toLocaleString()}
            </span>
          </div>
          <p className="text-blue-200 text-xs">Reputation Points</p>
          <div className="mt-2 w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-[10px] text-blue-200 mt-1">
            {nextLevel - Math.min(user.reputationPoints, nextLevel)} pts to next level
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
        {[
          { label: 'Issues Reported', value: user.reportedIssuesCount, icon: AlertCircle },
          { label: 'Issues Resolved', value: user.resolvedIssuesCount, icon: CheckCircle2 },
          { label: 'Total Votes', value: user.votesCount, icon: ThumbsUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center">
            <Icon className="w-4 h-4 text-blue-200 mx-auto mb-1" />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-[11px] text-blue-200">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { issues, isLoading, fetchIssues } = useIssues({ autoFetch: false });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    totalVotes: 0,
  });

  useSocket();

  useEffect(() => {
    // Fetch top priority issues
    fetchIssues({ sort: '-priorityScore', limit: 5, status: '' });

    // Fetch leaderboard
    usersApi
      .getLeaderboard({ limit: 5 })
      .then((res) => {
        setLeaderboard(res.data.data.leaderboard);
      })
      .catch(() => {});

    // Fetch global stats (from public issues endpoint)
    issuesApi
      .getAll({ limit: 1 })
      .then((res) => {
        const total = res.data.data.pagination?.total || 0;
        setGlobalStats((prev) => ({ ...prev, totalIssues: total }));
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const STATS = [
    {
      label: 'Issues Reported',
      value: user?.reportedIssuesCount ?? 0,
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+12% this month',
      trendUp: true,
    },
    {
      label: 'Issues Resolved',
      value: user?.resolvedIssuesCount ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      trend: '+8% this month',
      trendUp: true,
    },
    {
      label: 'Votes Cast',
      value: user?.votesCount ?? 0,
      icon: ThumbsUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      trend: 'Community engagement',
      trendUp: true,
    },
    {
      label: 'Reputation Points',
      value: user?.reputationPoints ?? 0,
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      trend: 'Keep contributing!',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user?.name?.split(' ')[0]}! 👋`}
        actions={
          <Link
            href={ROUTES.REPORT}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Report Issue</span>
          </Link>
        }
      />

      {/* User Banner */}
      <UserStatsBanner />

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    'flex flex-col gap-3 p-4 rounded-2xl',
                    'transition-all duration-150',
                    'group',
                    action.color
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      action.iconBg
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Personal Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Your Stats
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))
            : STATS.map((stat, idx) => (
                <StatsCard key={stat.label} {...stat} delay={idx * 0.08} />
              ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Priority Issues */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              🔥 Top Priority Issues
            </h2>
            <Link
              href={ROUTES.ISSUES}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : issues.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No issues yet"
              description="Be the first to report a civic issue in your community!"
              action={{
                label: 'Report an Issue',
                onClick: () => {},
              }}
              compact
            />
          ) : (
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue: any, idx: number) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <IssueCard issue={issue} compact />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            🏆 Leaderboard
          </h2>
          <LeaderboardCard entries={leaderboard} />

          {/* Tips card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="civic-card p-4 mt-4"
          >
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Earn More Points
            </h4>
            <div className="space-y-2">
              {[
                { action: 'Report an issue', points: '+10 pts' },
                { action: 'Vote on issues', points: '+2 pts'  },
                { action: 'Add a comment',  points: '+3 pts'  },
                { action: 'Issue resolved', points: '+25 pts' },
              ].map(({ action, points }) => (
                <div
                  key={action}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {action}
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {points}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

