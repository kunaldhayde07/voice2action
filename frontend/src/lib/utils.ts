import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { IssueStatus, UrgencyLevel, BadgeLevel } from '@/types';
import {
  ISSUE_STATUSES,
  URGENCY_LEVELS,
  BADGE_CONFIG,
  CATEGORY_ICONS,
  MARKER_COLORS,
  URGENCY_COLORS,
} from './constants';

// ─── Tailwind ─────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Utils ───────────────────────────────────────────────────────────────

export function timeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

export function formatDate(dateString: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), fmt);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy • h:mm a');
  } catch {
    return 'Invalid date';
  }
}

export function getDaysUnresolved(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// ─── Issue Status Utils ───────────────────────────────────────────────────────

export function getStatusConfig(status: IssueStatus) {
  return (
    ISSUE_STATUSES.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      color: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-400',
    }
  );
}

export function getUrgencyConfig(urgency: UrgencyLevel) {
  return (
    URGENCY_LEVELS.find((u) => u.value === urgency) ?? {
      value: urgency,
      label: urgency,
      color: 'bg-gray-100 text-gray-700',
    }
  );
}

export function getStatusLabel(status: IssueStatus): string {
  return getStatusConfig(status).label;
}

export function getMarkerColor(status: IssueStatus): string {
  return MARKER_COLORS[status] ?? '#6B7280';
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  return URGENCY_COLORS[urgency] ?? '#6B7280';
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '📋';
}

// ─── Badge / Reputation ───────────────────────────────────────────────────────

export function getBadgeLevel(points: number): BadgeLevel {
  if (points >= 500) return 'platinum';
  if (points >= 200) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}

export function getBadgeConfig(level: BadgeLevel) {
  return BADGE_CONFIG[level];
}

// ─── Priority Score ───────────────────────────────────────────────────────────

export function getPriorityLabel(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 80)
    return { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' };
  if (score >= 50)
    return { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' };
  if (score >= 25)
    return { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  return { label: 'Low', color: 'text-green-700', bg: 'bg-green-100' };
}

// ─── String Utils ─────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ─── Image Utils ──────────────────────────────────────────────────────────────

export function getImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder-image.png';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
}

export function getAvatarFallback(name: string): string {
  return name
    .split(' ')
    .map((n: any) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Coordinate Utils ─────────────────────────────────────────────────────────

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// ─── Storage Utils ────────────────────────────────────────────────────────────

export function setLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

export function getLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

// ─── Error Utils ──────────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

// ─── File Utils ───────────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
}

// ─── Query String Utils ───────────────────────────────────────────────────────

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join('&');
  return query ? `?${query}` : '';
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}