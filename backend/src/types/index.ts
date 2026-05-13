import { Document, Types } from 'mongoose';

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

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
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
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IIssue extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: IssueCategory;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  status: IssueStatus;
  urgency: UrgencyLevel;
  votesCount: number;
  priorityScore: number;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  resolvedAt?: Date;
  rejectionReason?: string;
  duplicateOf?: Types.ObjectId;
  tags: string[];
  viewsCount: number;
  commentsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVote extends Document {
  _id: Types.ObjectId;
  issue: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  issue?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'vote_received'
  | 'issue_status_changed'
  | 'issue_resolved'
  | 'comment_received'
  | 'issue_verified'
  | 'system';

export interface IComment extends Document {
  _id: Types.ObjectId;
  issue: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  isAdminComment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueStatusLog extends Document {
  _id: Types.ObjectId;
  issue: Types.ObjectId;
  previousStatus: IssueStatus;
  newStatus: IssueStatus;
  changedBy: Types.ObjectId;
  note?: string;
  createdAt: Date;
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginatedResult<T> {
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

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: unknown[];
}


declare global {
  namespace Express {
    interface User extends IUser {}
    
    interface Request {
      user?: IUser;
    }
  }
}