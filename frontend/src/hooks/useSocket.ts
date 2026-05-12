'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useIssueStore } from '@/store/issueStore';
import { useNotificationStore } from '@/store/notificationStore';
import { SOCKET_EVENTS } from '@/lib/constants';
import {
  Issue,
  Notification,
  SocketVoteUpdate,
  SocketIssueUpdate,
} from '@/types';
import toast from 'react-hot-toast';

interface UseSocketOptions {
  onNewIssue?: (issue: Issue) => void;
  onIssueUpdated?: (data: SocketIssueUpdate) => void;
  onVoteUpdated?: (data: SocketVoteUpdate) => void;
  onNewNotification?: (notification: Notification) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addIssueLocally, updateIssueLocally } = useIssueStore();
  const { addNotification } = useNotificationStore();

  const {
    onNewIssue,
    onIssueUpdated,
    onVoteUpdated,
    onNewNotification,
  } = options;

  const setupListeners = useCallback(
    (socket: Socket) => {
      // ── New Issue ──────────────────────────────────────────────
      socket.on(SOCKET_EVENTS.NEW_ISSUE, (issue: Issue) => {
        addIssueLocally(issue);
        toast.success(`New issue reported: ${issue.title}`, {
          icon: '📍',
          duration: 4000,
        });
        onNewIssue?.(issue);
      });

      // ── Issue Updated ──────────────────────────────────────────
      socket.on(SOCKET_EVENTS.ISSUE_UPDATED, (data: SocketIssueUpdate) => {
        updateIssueLocally(data.issueId, {
          status: data.status,
          priorityScore: data.priorityScore,
        });
        onIssueUpdated?.(data);
      });

      // ── Issue Resolved ─────────────────────────────────────────
      socket.on(
        SOCKET_EVENTS.ISSUE_RESOLVED,
        (data: { issueId: string }) => {
          updateIssueLocally(data.issueId, { status: 'resolved' });
          toast.success('An issue has been resolved! ✅', { duration: 3000 });
        }
      );

      // ── Vote Updated ───────────────────────────────────────────
      socket.on(SOCKET_EVENTS.VOTE_UPDATED, (data: SocketVoteUpdate) => {
        updateIssueLocally(data.issueId, {
          votesCount: data.votesCount,
          priorityScore: data.priorityScore,
        });
        onVoteUpdated?.(data);
      });

      // ── New Notification ───────────────────────────────────────
      socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification: Notification) => {
        addNotification(notification);
        toast(notification.title, {
          icon: '🔔',
          duration: 5000,
          style: {
            background: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #BFDBFE',
          },
        });
        onNewNotification?.(notification);
      });
    },
    [
      addIssueLocally,
      updateIssueLocally,
      addNotification,
      onNewIssue,
      onIssueUpdated,
      onVoteUpdated,
      onNewNotification,
    ]
  );

  const cleanupListeners = useCallback((socket: Socket) => {
    socket.off(SOCKET_EVENTS.NEW_ISSUE);
    socket.off(SOCKET_EVENTS.ISSUE_UPDATED);
    socket.off(SOCKET_EVENTS.ISSUE_RESOLVED);
    socket.off(SOCKET_EVENTS.VOTE_UPDATED);
    socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
    socket.off(SOCKET_EVENTS.ANALYTICS_UPDATE);
  }, []);

  useEffect(() => {
    const token = accessToken || undefined;
    const socket = initSocket(token);
    socketRef.current = socket;

    setupListeners(socket);

    return () => {
      if (socketRef.current) {
        cleanupListeners(socketRef.current);
      }
    };
  }, [isAuthenticated, accessToken, setupListeners, cleanupListeners]);

  const emit = useCallback((event: string, data?: unknown) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
  }, [emit]);

  const leaveRoom = useCallback((roomId: string) => {
    emit(SOCKET_EVENTS.LEAVE_ROOM, roomId);
  }, [emit]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    emit,
    joinRoom,
    leaveRoom,
  };
};