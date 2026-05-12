'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle, X, ExternalLink, MapPin } from 'lucide-react';
import { DuplicateCheckResult } from '@/types';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { ROUTES } from '@/lib/constants';

interface DuplicateWarningProps {
  result: DuplicateCheckResult;
  onDismiss: () => void;
}

export function DuplicateWarning({ result, onDismiss }: DuplicateWarningProps) {
  if (!result.hasDuplicates) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
            Similar issues detected nearby!
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
            {result.nearbyIssues.length} similar issue
            {result.nearbyIssues.length > 1 ? 's' : ''} found within 200m.
            Consider voting on an existing issue instead of creating a duplicate.
          </p>

          <div className="space-y-2">
            {result.nearbyIssues.map((issue) => (
              <Link
                key={issue._id}
                href={`${ROUTES.ISSUES}/${issue._id}`}
                target="_blank"
                className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-700/50 hover:border-amber-400 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <IssueStatusBadge status={issue.status} size="sm" />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {issue.distance}m away
                    </span>
                    <span className="text-xs text-gray-400">
                      👍 {issue.votesCount} votes
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 group-hover:text-blue-600" />
              </Link>
            ))}
          </div>

          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium">
            You can still submit your report if it&apos;s a different issue.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}