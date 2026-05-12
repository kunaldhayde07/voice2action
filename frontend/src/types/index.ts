export type IssueCategory =
  | 'Road & Infrastructure'
  | 'Water & Sewage'
  | 'Electricity & Power'
  | 'Garbage & Sanitation'
  | 'Public Safety'
  | 'Parks & Recreation'
  | 'Noise Pollution'
  | 'Air Quality'
  | 'Public Transport'
  | 'Street Lighting'
  | 'Building & Construction'
  | 'Animal Control'
  | 'Other';

export type IssueStatus =
  | 'pending'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'duplicate';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'citizen' | 'admin' | 'super_admin';
export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type NotificationType =
  | 'vote_received'
  | 'issue_status_changed'
  | 'issue_resolved'
  | 'comment_received'
  | 'issue_verified'
  | 'system';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  reputationPoints: number;
  reportedIssuesCount: number;
  resolvedIssuesCount: number;
  votesCount: number;
  bio?: string;
  location?: string;
  isActive: boolean;
  badgeLevel?: BadgeLevel;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  googleId?: string;
}

// ─── Issue ───────────────────────────────────────────────────────────────────

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  images: string[];
  location: IssueLocation;
  address: string;
  status: IssueStatus;
  urgency: UrgencyLevel;
  votesCount: number;
  priorityScore: number;
  createdBy: User;
  assignedTo?: User;
  resolvedAt?: string;
  rejectionReason?: string;
  duplicateOf?: string;
  tags: string[];
  viewsCount: number;
  commentsCount: number;
  isVerified: boolean;
  hasVoted?: boolean;
  unresolvedDays?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Vote ────────────────────────────────────────────────────────────────────

export interface Vote {
  _id: string;
  issue: string;
  user: string;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  _id: string;
  recipient: string;
  sender?: Pick<User, '_id' | 'name' | 'avatar'>;
  type: NotificationType;
  title: string;
  message: string;
  issue?: Pick<Issue, '_id' | 'title' | 'status'>;
  isRead: boolean;
  createdAt: string;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface Comment {
  _id: string;
  issue: string;
  author: Pick<User, '_id' | 'name' | 'avatar' | 'role' | 'isVerified' | 'reputationPoints'>;
  content: string;
  isAdminComment: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Issue Status Log ─────────────────────────────────────────────────────────

export interface IssueStatusLog {
  _id: string;
  issue: string;
  previousStatus: IssueStatus;
  newStatus: IssueStatus;
  changedBy: Pick<User, '_id' | 'name' | 'role'>;
  note?: string;
  createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface IssueFilters {
  status?: IssueStatus | '';
  category?: IssueCategory | '';
  urgency?: UrgencyLevel | '';
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

// ─── Admin Analytics ─────────────────────────────────────────────────────────

export interface AdminStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  totalUsers: number;
  totalVotes: number;
  resolutionRate: number;
  avgResolutionDays: number;
}

export interface CategoryStat {
  _id: string;
  count: number;
  resolved: number;
}

export interface StatusStat {
  _id: IssueStatus;
  count: number;
}

export interface UrgencyStat {
  _id: UrgencyLevel;
  count: number;
}

export interface DailyIssueStat {
  _id: string;
  count: number;
  resolved: number;
}

export interface MonthlyTrend {
  _id: { year: number; month: number };
  count: number;
  resolved: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentIssues: Issue[];
  categoryStats: CategoryStat[];
  urgencyStats: UrgencyStat[];
  monthlyTrend: MonthlyTrend[];
  topIssues: Issue[];
  resolutionRateData: StatusStat[];
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

export interface DuplicateIssue {
  _id: string;
  title: string;
  category: string;
  status: IssueStatus;
  votesCount: number;
  distance: number;
  address: string;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  nearbyIssues: DuplicateIssue[];
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

export interface GeocodeResult {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  _id: string;
  name: string;
  avatar?: string;
  reputationPoints: number;
  reportedIssuesCount: number;
  resolvedIssuesCount: number;
  votesCount: number;
}

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface SocketVoteUpdate {
  issueId: string;
  votesCount: number;
  priorityScore: number;
  userId: string;
}

export interface SocketIssueUpdate {
  issueId: string;
  status: IssueStatus;
  priorityScore: number;
  updatedBy: string;
}

export interface SocketNewIssue extends Issue {}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface ReportIssueFormData {
  title: string;
  description: string;
  category: IssueCategory | '';
  urgency: UrgencyLevel;
  address: string;
  latitude: number | null;
  longitude: number | null;
  tags: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileFormData {
  name?: string;
  bio?: string;
  location?: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateIssueStatusFormData {
  status: IssueStatus;
  note?: string;
  rejectionReason?: string;
}