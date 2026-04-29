'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import MapView from '@/components/map/MapView';
import IssueDetail from '@/components/issues/IssueDetail';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { useIssues } from '@/hooks/useIssues';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Issue, WsMessage } from '@/types';
import { categoryColors } from '@/lib/utils';

export default function MapPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { issues, loading, updateIssueVoteCount, addNewIssue, updateIssueStatus } = useIssues({
    status: 'all',
    sortBy: 'priority',
  });

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'vote_update' && msg.issueId && msg.voteCount !== undefined) {
      updateIssueVoteCount(msg.issueId, msg.voteCount);
    }
    if (msg.type === 'new_issue' && msg.issue) {
      addNewIssue(msg.issue);
    }
    if (msg.type === 'status_update' && msg.issueId && msg.status) {
      updateIssueStatus(msg.issueId, msg.status as any);
    }
  }, [updateIssueVoteCount, addNewIssue, updateIssueStatus]);

  const { isConnected } = useWebSocket({ onMessage: handleWsMessage });

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <>
      <Navbar isConnected={isConnected} />

      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Live Issue Map</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time city-wide issue visualization
              </p>
            </div>

            {/* quick stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-600">{pendingCount} Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">{inProgressCount} In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">{resolvedCount} Resolved</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <Spinner size="lg" className="mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Loading map data...</p>
                </div>
              </div>
            ) : (
              <MapView
                issues={issues}
                onIssueClick={setSelectedIssue}
                showHeatmap={false}
                height="600px"
              />
            )}
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            Click markers to view issue details · Toggle heatmap to see density zones
          </p>
        </div>
      </div>

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
    </>
  );
}