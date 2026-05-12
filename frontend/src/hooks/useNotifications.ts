'use client';

import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { NOTIFICATION_POLL_INTERVAL } from '@/lib/constants';

export const useNotifications = (autoFetch = false) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearError,
  } = useNotificationStore();

  const { isAuthenticated } = useAuthStore();

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && autoFetch) {
      fetchNotifications(true);
    }
  }, [isAuthenticated, autoFetch, fetchNotifications]);

  // Poll for unread count every 30s (fallback when socket disconnects)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, NOTIFICATION_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    fetchNotifications(false);
  }, [hasMore, isLoading, fetchNotifications]);

  const handleMarkAsRead = useCallback(
    async (ids?: string[]) => {
      await markAsRead(ids);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id);
    },
    [deleteNotification]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    addNotification,
    fetchNotifications,
    clearError,
  };
};