'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  MessageSquare,
  Eye,
  Clock,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { cn, timeAgo, getCategoryIcon, getImageUrl, truncate } from '@/lib/utils';
import { Issue } from '@/types';
import { IssueStatusBadge, UrgencyBadge } from './IssueStatusBadge';
import { VoteButton } from './VoteButton';
import { PriorityBadge } from './PriorityBadge';
import { Avatar } from '@/components/shared/Avatar';
import { ROUTES } from '@/lib/constants';

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
  showPriority?: boolean;
}

export function IssueCard({
  issue,
  compact = false,
  showPriority = true,
}: IssueCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = issue.images.length > 0 && !imageError;
  const categoryIcon = getCategoryIcon(issue.category);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="civic-card overflow-hidden group"
    >
      <Link
        href={`${ROUTES.ISSUES}/${issue._id}`}
        className="block focus-visible:outline-none"
      >
        {/* Image */}
        {hasImage && !compact && (
          <div className="relative h-44 overflow-hidden">
            <Image
              src={getImageUrl(issue.images[0])}
              alt={issue.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* Urgency badge on image */}
            <div className="absolute top-3 right-3">
              <UrgencyBadge urgency={issue.urgency} size="sm" />
            </div>
          </div>
        )}

        <div className={cn('p-4', compact ? 'p-3.5' : 'p-5')}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Category icon */}
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                {categoryIcon}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3
                  className={cn(
                    'font-semibold text-gray-900 dark:text-white leading-snug',
                    'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors',
                    compact ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'
                  )}
                >
                  {issue.title}
                </h3>

                {/* Category */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {issue.category}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
              <IssueStatusBadge status={issue.status} size="sm" />
            </div>
          </div>

          {/* Description (non-compact) */}
          {!compact && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3 line-clamp-2">
              {issue.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {!compact && <UrgencyBadge urgency={issue.urgency} size="sm" />}
            {showPriority && (
              <PriorityBadge score={issue.priorityScore} size="sm" />
            )}
            {issue.isVerified && (
              <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <Shield className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {truncate(issue.address, compact ? 40 : 60)}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            {/* Author + time */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                src={issue.createdBy?.avatar}
                name={issue.createdBy?.name}
                size="xs"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {issue.createdBy?.name}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {timeAgo(issue.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              {/* Views */}
              {!compact && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{issue.viewsCount}</span>
                </div>
              )}

              {/* Comments */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{issue.commentsCount}</span>
              </div>

              {/* Vote */}
              <VoteButton
                issueId={issue._id}
                votesCount={issue.votesCount}
                hasVoted={issue.hasVoted ?? false}
                size="sm"
              />
            </div>
          </div>

          {/* Resolved indicator */}
          {issue.status === 'resolved' && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved {issue.resolvedAt ? timeAgo(issue.resolvedAt) : ''}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}