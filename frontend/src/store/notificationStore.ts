import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;

  // Actions
  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (ids?: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,

  fetchNotifications: async (reset = false) => {
    const currentPage = reset ? 1 : get().page;
    set({ isLoading: true, error: null });

    try {
      const response = await notificationsApi.getAll({
        page: currentPage,
        limit: 15,
      });
      const { data, pagination, unreadCount } = response.data.data;

      set((state) => ({
        notifications: reset ? data : [...state.notifications, ...data],
        unreadCount,
        hasMore: pagination.hasNext,
        page: currentPage + 1,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.data.data.count });
    } catch {
      // Silently fail
    }
  },

  markAsRead: async (ids) => {
    try {
      await notificationsApi.markAsRead(ids);
      set((state) => ({
        notifications: state.notifications.map((n: any) =>
          !ids || ids.includes(n._id) ? { ...n, isRead: true } : n
        ),
        unreadCount: ids
          ? Math.max(
              0,
              state.unreadCount -
                state.notifications.filter(
                  (n: any) => ids.includes(n._id) && !n.isRead
                ).length
            )
          : 0,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n: any) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsApi.delete(id);
      set((state) => {
        const notification = state.notifications.find((n: any) => n._id === id);
        return {
          notifications: state.notifications.filter((n: any) => n._id !== id),
          unreadCount:
            notification && !notification.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
        };
      });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearError: () => set({ error: null }),
}));