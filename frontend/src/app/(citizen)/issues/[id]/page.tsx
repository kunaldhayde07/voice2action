'use client';

import { useEffect, useState } from 'react';
import { createContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Eye,
  MessageSquare,
  Shield,
  ChevronLeft,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Tag,
  Activity,
} from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useAuthStore } from '@/store/authStore';
import { commentsApi, issuesApi } from '@/lib/api';
import { Comment, Issue, IssueStatusLog } from '@/types';
import { IssueStatusBadge, UrgencyBadge } from '@/components/issues/IssueStatusBadge';
import { VoteButton } from '@/components/issues/VoteButton';
import { PriorityBadge } from '@/components/issues/PriorityBadge';
import { Avatar } from '@/components/shared/Avatar';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  cn,
  timeAgo,
  formatDateTime,
  getImageUrl,
  getCategoryIcon,
  getStatusConfig,
} from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

// ─── Status Timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ logs }: { logs: IssueStatusLog[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="civic-card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-600" />
        Status History
      </h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {logs.map((log, idx) => {
            const newStatusCfg = getStatusConfig(log.newStatus);
            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex gap-4 relative"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                    newStatusCfg.color
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', newStatusCfg.dot)} />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <IssueStatusBadge status={log.newStatus} size="sm" />
                    <span className="text-xs text-gray-400">
                      by {log.changedBy?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                  {log.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                      {log.note}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  onDelete,
  currentUserId,
  isAdmin,
}: {
  comment: Comment;
  onDelete: (id: string) => void;
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const canDelete =
    isAdmin || comment.author._id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'flex gap-3 p-4 rounded-2xl',
        comment.isAdminComment
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
          : 'bg-gray-50 dark:bg-gray-800/50'
      )}
    >
      <Avatar
        src={comment.author.avatar}
        name={comment.author.name}
        size="sm"
        showBadge
        user={comment.author as any}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {comment.author.name}
          </span>
          {comment.isAdminComment && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-semibold rounded-full">
              <Shield className="w-2.5 h-2.5" />
              Official
            </span>
          )}
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Comment Form ─────────────────────────────────────────────────────────────

function CommentForm({
  issueId,
  onCommentAdded,
}: {
  issueId: string;
  onCommentAdded: (comment: Comment) => void;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const response = await commentsApi.create(issueId, { content: content.trim() });
      onCommentAdded(response.data.data.comment as Comment);
      setContent('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <a href={ROUTES.LOGIN} className="text-blue-600 font-medium hover:underline">
          Login
        </a>{' '}
        to add a comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          maxLength={1000}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm resize-none',
            'bg-gray-50 dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white placeholder:text-gray-400',
            'focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20',
            'transition-all duration-150'
          )}
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
          {content.length}/1000
        </span>
      </div>
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className={cn(
          'self-end flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium',
          'bg-blue-600 hover:bg-blue-700 text-white',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'shadow-md shadow-blue-500/20'
        )}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Post</span>
      </button>
    </form>
  );
}

// ─── Issue Detail Page ────────────────────────────────────────────────────────

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const issueId = params.id as string;

  const { fetchIssueById } = useIssueStore();
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [issue, setIssue] = useState<Issue | null>(null);
  const [statusLogs, setStatusLogs] = useState<IssueStatusLog[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    const loadIssue = async () => {
      setIsLoading(true);
      try {
        const response = await issuesApi.getById(issueId);
        const data = response.data.data;
        setIssue(data.issue as Issue);
        setStatusLogs(data.statusLogs as IssueStatusLog[]);
      } catch {
        toast.error('Issue not found');
        router.push(ROUTES.ISSUES);
      } finally {
        setIsLoading(false);
      }
    };

    const loadComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await commentsApi.getByIssue(issueId);
        setComments(response.data.data.data as Comment[]);
      } catch {
        // Silently fail
      } finally {
        setCommentsLoading(false);
      }
    };

    loadIssue();
    loadComments();
  }, [issueId, router]);

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
    if (issue) {
      setIssue({ ...issue, commentsCount: issue.commentsCount + 1 });
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (issue) {
        setIssue({ ...issue, commentsCount: Math.max(0, issue.commentsCount - 1) });
      }
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (isLoading) return <PageLoader label="Loading issue..." />;
  if (!issue) return null;

  const categoryIcon = getCategoryIcon(issue.category);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Issues
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="civic-card overflow-hidden"
          >
            {/* Images */}
            {issue.images.length > 0 && (
              <div className="relative">
                <div className="relative h-64 sm:h-80 overflow-hidden">
                  <Image
                    src={getImageUrl(issue.images[activeImage])}
                    alt={issue.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
                {issue.images.length > 1 && (
                  <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
                    {issue.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={cn(
                          'relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 transition-all',
                          activeImage === idx
                            ? 'ring-blue-500'
                            : 'ring-transparent hover:ring-gray-300'
                        )}
                      >
                        <Image
                          src={getImageUrl(img)}
                          alt={`Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {issue.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {issue.category}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <IssueStatusBadge status={issue.status} />
                <UrgencyBadge urgency={issue.urgency} />
                <PriorityBadge score={issue.priorityScore} />
                {issue.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Verified by Admin
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5">
                {issue.description}
              </p>

              {/* Tags */}
              {issue.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {issue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{issue.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{formatDateTime(issue.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{issue.viewsCount} views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{issue.commentsCount} comments</span>
                </div>
              </div>

              {/* Resolved banner */}
              {issue.status === 'resolved' && issue.resolvedAt && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Issue Resolved ✅
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Resolved {timeAgo(issue.resolvedAt)}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="civic-card p-5"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Comments ({issue.commentsCount})
            </h3>

            <CommentForm
              issueId={issue._id}
              onCommentAdded={handleCommentAdded}
            />

            <div className="mt-5 space-y-3">
              {commentsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : comments.length === 0 ? (
                <EmptyState
                  emoji="💬"
                  title="No comments yet"
                  description="Be the first to comment on this issue"
                  compact
                />
              ) : (
                <AnimatePresence>
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      onDelete={handleCommentDelete}
                      currentUserId={user?._id}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">
          {/* Vote Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="civic-card p-5 text-center"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Community Support
            </p>
            <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
              {issue.votesCount}
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {issue.votesCount === 1 ? 'citizen' : 'citizens'} voted
            </p>
            <div className="w-full">
              <VoteButton
                issueId={issue._id}
                votesCount={issue.votesCount}
                hasVoted={issue.hasVoted ?? false}
                size="md"
                showCount={false}
              />
            </div>
            {issue.hasVoted && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                ✓ You voted for this issue
              </p>
            )}
          </motion.div>

          {/* Reporter Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="civic-card p-5"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              Reported By
            </h3>
            <div className="flex items-center gap-3">
              <Avatar
                src={issue.createdBy?.avatar}
                name={issue.createdBy?.name}
                size="md"
                showBadge
                user={issue.createdBy as any}
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {issue.createdBy?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {issue.createdBy?.reputationPoints} reputation pts
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(issue.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="civic-card p-5"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              Location
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {issue.address}
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Lat: {issue.location.coordinates[1].toFixed(6)}</p>
              <p>Lng: {issue.location.coordinates[0].toFixed(6)}</p>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${issue.location.coordinates[1]}&mlon=${issue.location.coordinates[0]}&zoom=16`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </a>
          </motion.div>

          {/* Status Timeline */}
          {statusLogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatusTimeline logs={statusLogs} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}