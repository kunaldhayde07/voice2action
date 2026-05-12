import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { API_URL } from './constants';
import { ApiResponse } from '@/types';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: () => api.post('/auth/refresh-token'),

  getMe: () => api.get('/auth/me'),

  googleLogin: () => {
    window.location.href = `${API_URL}/api/auth/google`;
  },
};

// ─── Issues API ───────────────────────────────────────────────────────────────

export const issuesApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/issues', { params }),

  getById: (id: string) => api.get(`/issues/${id}`),

  create: (formData: FormData) =>
    api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStatus: (
    id: string,
    data: { status: string; note?: string; rejectionReason?: string }
  ) => api.patch(`/issues/${id}/status`, data),

  delete: (id: string) => api.delete(`/issues/${id}`),

  getMyIssues: (params?: Record<string, string | number | undefined>) =>
    api.get('/issues/my-issues', { params }),

  getNearby: (params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }) => api.get('/issues/nearby', { params }),

  getMapIssues: (params?: Record<string, string | number | undefined>) =>
    api.get('/issues/map', { params }),

  checkDuplicates: (params: {
    latitude: number;
    longitude: number;
    category: string;
  }) => api.get('/issues/check-duplicates', { params }),

  reverseGeocode: (params: { lat: number; lng: number }) =>
    api.get('/issues/geocode/reverse', { params }),
};

// ─── Votes API ────────────────────────────────────────────────────────────────

export const votesApi = {
  toggle: (issueId: string) => api.post(`/votes/${issueId}`),

  getMyVotes: () => api.get('/votes/my-votes'),
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    api.get('/notifications', { params }),

  getUnreadCount: () => api.get('/notifications/unread-count'),

  markAsRead: (notificationIds?: string[]) =>
    api.patch('/notifications/mark-read', { notificationIds }),

  markAllAsRead: () => api.patch('/notifications/mark-all-read'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ─── Comments API ─────────────────────────────────────────────────────────────

export const commentsApi = {
  getByIssue: (
    issueId: string,
    params?: Record<string, string | number | undefined>
  ) => api.get(`/comments/${issueId}`, { params }),

  create: (issueId: string, data: { content: string }) =>
    api.post(`/comments/${issueId}`, data),

  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  getProfile: (id: string) => api.get(`/users/${id}`),

  updateProfile: (formData: FormData) =>
    api.patch('/users/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.patch('/users/profile/change-password', data),

  getLeaderboard: (params?: { limit?: number }) =>
    api.get('/users/leaderboard', { params }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  getAnalytics: (params?: { period?: number }) =>
    api.get('/admin/analytics', { params }),

  getAllUsers: (params?: Record<string, string | number | undefined>) =>
    api.get('/admin/users', { params }),

  updateUserRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),

  toggleUserStatus: (userId: string) =>
    api.patch(`/admin/users/${userId}/toggle-status`),

  verifyIssue: (issueId: string) =>
    api.patch(`/admin/issues/${issueId}/verify`),
};

export default api;