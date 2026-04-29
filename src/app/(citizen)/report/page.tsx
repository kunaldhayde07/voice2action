'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import IssueForm from '@/components/issues/IssueForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function ReportPage() {
  const router = useRouter();
  const [successIssue, setSuccessIssue] = useState<any>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    issueId: string;
    similarity: number;
  } | null>(null);

  const { isConnected } = useWebSocket();

  const handleSuccess = (issue: any) => {
    setSuccessIssue(issue);
  };

  const handleDuplicate = (issueId: string, similarity: number) => {
    setDuplicateInfo({ issueId, similarity });
  };

  return (
    <>
      <Navbar isConnected={isConnected} />

      <div className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Report a Local Issue</h1>
            </div>
            <p className="text-slate-500 text-sm ml-11">
              Your report goes directly to authority dashboards. Be specific for faster resolution.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <IssueForm
              onSuccess={handleSuccess}
              onDuplicateFound={handleDuplicate}
            />
          </div>
        </div>
      </div>

      {/* success modal */}
      <Modal
        open={!!successIssue}
        onClose={() => {
          setSuccessIssue(null);
          router.push('/feed');
        }}
        size="sm"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Issue Reported!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your report is now live and visible to local authorities. Other citizens can vote to prioritize it.
          </p>

          {successIssue && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6">
              <p className="text-sm font-medium text-slate-700">{successIssue.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                Category: {successIssue.category} · Status: Pending
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSuccessIssue(null);
                router.push('/feed');
              }}
            >
              View All Issues
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setSuccessIssue(null);
              }}
            >
              Report Another
            </Button>
          </div>
        </div>
      </Modal>

      {/* duplicate modal */}
      <Modal
        open={!!duplicateInfo}
        onClose={() => setDuplicateInfo(null)}
        title="Similar Issue Exists"
        size="sm"
      >
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ A similar issue ({Math.round((duplicateInfo?.similarity || 0) * 100)}% match) already exists nearby.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Please vote on the existing issue instead, or submit if your issue is distinct.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDuplicateInfo(null);
                router.push('/feed');
              }}
            >
              View Existing
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                // force submit despite duplicate
                setDuplicateInfo(null);
              }}
            >
              Submit Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}