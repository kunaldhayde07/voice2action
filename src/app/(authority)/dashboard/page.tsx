'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import StatsCard from '@/components/dashboard/StatsCard';
import PriorityList from '@/components/dashboard/PriorityList';
import CategoryChart from '@/components/dashboard/CategoryChart';
import MapView from '@/components/map/MapView';
import ToastContainer from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Issue, IssueStatus, WsMessage } from '@/types';

const AUTHORITY_TOKEN = process.env.NEXT_PUBLIC_AUTHORITY_TOKEN || 'admin2024';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [topIssues, setTopIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'queue'>('overview');
  const { toasts, addToast, removeToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, issuesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/issues?sortBy=priority&limit=50&status=all'),
      ]);

      const statsData = await statsRes.json();
      const issuesData = await issuesRes.json();

      setStats(statsData);
      setTopIssues(statsData.topIssues || []);
      setAllIssues(issuesData.issues || []);
    } catch {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'vote_update' && msg.issueId) {
      setTopIssues(prev =>
        prev.map(i => i._id === msg.issueId ? { ...i, voteCount: msg.voteCount! } : i)
      );
    }
    if (msg.type === 'new_issue' && msg.issue) {
      addToast(`New issue: ${msg.issue.title.slice(0, 40)}`, 'info');
      fetchDashboardData();
    }
    if (msg.type === 'status_update') {
      fetchDashboardData();
    }
  }, [addToast, fetchDashboardData]);

  const { isConnected } = useWebSocket({ onMessage: handleWsMessage });

  useEffect(() => {
    fetchDashboardData();
    // auto-refresh every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-authority-token': AUTHORITY_TOKEN,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      addToast(`Status updated to ${status.replace('_', ' ')}`, 'success');
      fetchDashboardData();
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleResolve = async (issueId: string, note: string, proofImage: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-authority-token': AUTHORITY_TOKEN,
        },
        body: JSON.stringify({ resolvedNote: note, resolvedImage: proofImage }),
      });

      if (!res.ok) throw new Error('Failed to resolve issue');

      addToast('Issue marked as resolved ✓', 'success');
      fetchDashboardData();
    } catch {
      addToast('Failed to resolve issue', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar isConnected={isConnected} />

      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Authority Dashboard</h1>
              </div>
              <p className="text-sm text-slate-500 ml-13">
                Governance Intelligence Center ·{' '}
                <span className={isConnected ? 'text-emerald-600' : 'text-slate-400'}>
                  {isConnected ? '● Live monitoring' : '○ Connecting...'}
                </span>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Refresh
            </Button>
          </div>

          {/* stats cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard
                label="Total Issues"
                value={stats.totalIssues}
                color="blue"
                index={0}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <StatsCard
                label="Pending"
                value={stats.pendingCount}
                color="amber"
                index={1}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatsCard
                label="In Progress"
                value={stats.inProgressCount}
                color="purple"
                index={2}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <StatsCard
                label="Resolved"
                value={stats.resolvedCount}
                color="emerald"
                index={3}
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          )}

          {/* tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
            {([
              { key: 'overview', label: '📊 Overview' },
              { key: 'queue', label: '🔥 Priority Queue' },
              { key: 'map', label: '🗺️ City Map' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* tab content */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <PriorityList
                  issues={topIssues}
                  onStatusChange={handleStatusChange}
                  onResolve={handleResolve}
                />
              </div>

              <div className="space-y-6">
                {stats && (
                  <CategoryChart data={stats.categoryCounts} />
                )}

                {/* recent activity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Reports</h3>
                  <div className="space-y-3">
                    {stats?.recentActivity?.map((issue: Issue, i: number) => (
                      <div key={issue._id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-700 leading-snug">
                            {issue.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {issue.category} · {issue.voteCount} votes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* resolution rate */}
                {stats && stats.totalIssues > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Resolution Rate</h3>
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-slate-900">
                          {Math.round((stats.resolvedCount / stats.totalIssues) * 100)}%
                        </span>
                        <span className="text-xs text-slate-400">
                          {stats.resolvedCount}/{stats.totalIssues}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.resolvedCount / stats.totalIssues) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'queue' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PriorityList
                issues={allIssues.filter(i => i.status !== 'resolved')}
                onStatusChange={handleStatusChange}
                onResolve={handleResolve}
              />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                <MapView
                  issues={allIssues}
                  showHeatmap={true}
                  height="650px"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}