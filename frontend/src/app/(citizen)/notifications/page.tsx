'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Shield,
  Info,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Notification, NotificationType } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { NotificationSkeleton } from '@/components/shared/SkeletonCard';
import { cn, timeAgo } from '@/lib/utils';

// ─── Notification Icon Map ────────────────────────────────────────────────────

const NOTIF_ICONS: Record<
  NotificationType,
  { icon: React.ElementType; bg: string; color: string }
> = {
  vote_received: {
    icon: ThumbsUp,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  issue_status_changed: {
    icon: AlertCircle,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  issue_resolved: {
    icon: CheckCircle2,
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
  },
  comment_received: {
    icon: MessageSquare,
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    color: 'text-purple-600 dark:text-purple-400',
  },
  issue_verified: {
    icon: Shield,
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    color: 'text-teal-600 dark:text-teal-400',
  },
  system: {
    icon: Info,
    bg: 'bg-gray-100 dark:bg-gray-700',
    color: 'text-gray-600 dark:text-gray-400',
  },
};

// ─── Notification Item ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIF_ICONS[notification.type] ?? NOTIF_ICONS.system;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150',
        'group cursor-pointer',
        !notification.isRead
          ? 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
      )}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification._id);
      }}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          !notification.isRead ? 'ml-0' : 'ml-5',
          config.bg
        )}
      >
        <Icon className={cn('w-5 h-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-snug',
            !notification.isRead
              ? 'font-semibold text-gray-900 dark:text-white'
              : 'font-medium text-gray-700 dark:text-gray-300'
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
          <Bell className="w-3 h-3" />
          {timeAgo(notification.createdAt)}
          {notification.issue && (
            <span className="ml-2 text-blue-500 hover:underline">
              · View issue →
            </span>
          )}
        </p>
      </div>

      {/* Actions (hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification._id);
            }}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
            title="Mark as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Notifications Page ───────────────────────────────────────────────────────

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    fetchNotifications,
  } = useNotifications(true);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <PageHeader
        title="Notifications"
        description="Stay updated on your civic issues"
        icon={Bell}
        badge={
          unreadCount > 0
            ? { label: `${unreadCount} unread`, color: 'bg-blue-100 text-blue-700' }
            : undefined
        }
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          ) : undefined
        }
      />

      {/* List */}
      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="No notifications yet"
          description="You'll be notified when someone votes on your issues, when status changes, or when issues get resolved."
        />
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => (
              <NotificationCard
                key={notif._id}
                notification={notif}
                onMarkRead={(id) => handleMarkAsRead([id])}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}

          {!hasMore && notifications.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-4">
              You&apos;re all caught up! ✅
            </p>
          )}
        </>
      )}
    </div>
  );
}