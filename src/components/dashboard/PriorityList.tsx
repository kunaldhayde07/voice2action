'use client';

import { useState } from 'react';
import { Issue, IssueStatus } from '@/types';
import { categoryIcons, categoryLabels, formatTimeAgo, cn } from '@/lib/utils';
import StatusBadge from '@/components/issues/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface PriorityListProps {
  issues: Issue[];
  onStatusChange: (issueId: string, status: IssueStatus) => void;
  onResolve: (issueId: string, note: string, proofImage: string) => void;
}

export default function PriorityList({ issues, onStatusChange, onResolve }: PriorityListProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProofImageBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResolve = async () => {
    if (!selectedIssue) return;
    setResolving(true);
    await onResolve(selectedIssue._id, resolveNote, proofImageBase64);
    setResolving(false);
    setSelectedIssue(null);
    setResolveNote('');
    setProofImageBase64('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Priority Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">Ranked by priority score — most urgent first</p>
        </div>

        <div className="divide-y divide-slate-100">
          {issues.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">
              No active issues 🎉
            </div>
          )}

          {issues.map((issue, i) => (
            <div key={issue._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* rank */}
                <div className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                  i === 0 ? 'bg-red-100 text-red-700' :
                    i === 1 ? 'bg-orange-100 text-orange-700' :
                      i === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                )}>
                  #{i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-slate-900 truncate">{issue.title}</span>
                    <StatusBadge status={issue.status} />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{categoryIcons[issue.category]} {categoryLabels[issue.category]}</span>
                    <span>▲ {issue.voteCount}</span>
                    <span>Score: {issue.priorityScore.toFixed(1)}</span>
                    <span>{formatTimeAgo(issue.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {issue.status === 'pending' && (
                    <button
                      onClick={() => onStatusChange(issue._id, 'in_progress')}
                      className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                    >
                      Start
                    </button>
                  )}

                  {issue.status !== 'resolved' && (
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="text-xs px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* resolve modal */}
      <Modal
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title="Mark Issue as Resolved"
        size="md"
      >
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-700">{selectedIssue?.title}</p>
            <p className="text-xs text-slate-500 mt-1">{selectedIssue?.description.slice(0, 100)}...</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Resolution Note
            </label>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Proof of Fix (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProofUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
            {proofImageBase64 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proofImageBase64}
                alt="Proof"
                className="mt-3 w-full h-40 object-cover rounded-xl border border-slate-200"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSelectedIssue(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={resolving}
              onClick={handleResolve}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}