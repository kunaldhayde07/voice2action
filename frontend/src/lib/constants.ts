export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Voice2Action';

export const ISSUE_CATEGORIES = [
  'Road & Infrastructure',
  'Water & Sewage',
  'Electricity & Power',
  'Garbage & Sanitation',
  'Public Safety',
  'Parks & Recreation',
  'Noise Pollution',
  'Air Quality',
  'Public Transport',
  'Street Lighting',
  'Building & Construction',
  'Animal Control',
  'Other',
] as const;

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
] as const;

export const ISSUE_STATUSES = [
  {
    value: 'pending',
    label: 'Pending',
    color: 'bg-gray-100 text-gray-700',
    dot: 'bg-gray-400',
  },
  {
    value: 'under_review',
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-400',
  },
  {
    value: 'duplicate',
    label: 'Duplicate',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-400',
  },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Road & Infrastructure': '🛣️',
  'Water & Sewage': '💧',
  'Electricity & Power': '⚡',
  'Garbage & Sanitation': '🗑️',
  'Public Safety': '🚨',
  'Parks & Recreation': '🌳',
  'Noise Pollution': '🔊',
  'Air Quality': '💨',
  'Public Transport': '🚌',
  'Street Lighting': '💡',
  'Building & Construction': '🏗️',
  'Animal Control': '🐾',
  Other: '📋',
};

export const MARKER_COLORS: Record<string, string> = {
  pending: '#6B7280',
  under_review: '#3B82F6',
  in_progress: '#F59E0B',
  resolved: '#10B981',
  rejected: '#EF4444',
  duplicate: '#8B5CF6',
};

export const URGENCY_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export const BADGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; min: number }
> = {
  bronze: {
    label: 'Bronze',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    min: 0,
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    min: 100,
  },
  gold: {
    label: 'Gold',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    min: 200,
  },
  platinum: {
    label: 'Platinum',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    min: 500,
  },
};

export const SORT_OPTIONS = [
  { value: '-priorityScore', label: 'Priority Score' },
  { value: '-votesCount', label: 'Most Voted' },
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-viewsCount', label: 'Most Viewed' },
] as const;

export const SOCKET_EVENTS = {
  NEW_ISSUE: 'new_issue',
  ISSUE_UPDATED: 'issue_updated',
  ISSUE_RESOLVED: 'issue_resolved',
  VOTE_UPDATED: 'vote_updated',
  NEW_NOTIFICATION: 'new_notification',
  ANALYTICS_UPDATE: 'analytics_update',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  REPORT: '/report',
  ISSUES: '/issues',
  MAP: '/map',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  MY_REPORTS: '/my-reports',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ISSUES: '/admin/issues',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_USERS: '/admin/users',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

export const DEFAULT_MAP_CENTER: [number, number] = [20.5937, 78.9629]; // India center
export const DEFAULT_MAP_ZOOM = 5;
export const DEFAULT_LOCATION_ZOOM = 14;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ITEMS_PER_PAGE = 10;
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30s