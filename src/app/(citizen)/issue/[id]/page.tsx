'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Issue } from '@/types';
import Navbar from '@/components/layout/Navbar';
import IssueDetail from '@/components/issues/IssueDetail';
import Spinner from '@/components/ui/Spinner';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isConnected } = useWebSocket();

  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/issues/' + id);
        if (!res.ok) {
          setError('Issue not found');
          return;
        }
        const data = await res.json();
        setIssue(data);
      } catch {
        setError('Failed to load issue');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleVoteSuccess = (newCount: number) => {
    if (!issue) return;
    setIssue({ ...issue, voteCount: newCount, hasVoted: true });
  };

  return (
    <>
      <Navbar isConnected={isConnected} />
      <div className='min-h-screen bg-slate-50 pt-16'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors'
          >
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Back to Feed
          </button>

          {loading && (
            <div className='flex items-center justify-center py-20'>
              <div className='text-center'>
                <Spinner size='lg' className='mx-auto mb-4' />
                <p className='text-slate-500 text-sm'>Loading issue...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className='bg-white rounded-2xl border border-slate-200 p-12 text-center'>
              <p className='text-5xl mb-4'>404</p>
              <h2 className='text-lg font-semibold text-slate-900 mb-2'>Issue Not Found</h2>
              <p className='text-slate-500 text-sm mb-6'>{error}</p>
              <button
                onClick={() => router.push('/feed')}
                className='px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors'
              >
                View All Issues
              </button>
            </div>
          )}

          {!loading && !error && issue && (
            <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
              <IssueDetail
                issue={issue}
                onVoteSuccess={handleVoteSuccess}
                onClose={() => router.back()}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}