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

export const ISSUE_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  DUPLICATE: 'duplicate',
} as const;

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const URGENCY_FACTORS = {
  low: 1,
  medium: 5,
  high: 15,
  critical: 30,
};

export const USER_ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const REPUTATION_POINTS = {
  REPORT_ISSUE: 10,
  VOTE: 2,
  ISSUE_RESOLVED: 25,
  COMMENT: 3,
  VERIFIED_BADGE: 50,
};

export const DUPLICATE_DETECTION_RADIUS_METERS = 200;
export const NEARBY_DENSITY_RADIUS_METERS = 1000;

export const SOCKET_EVENTS = {
  // Issue events
  NEW_ISSUE: 'new_issue',
  ISSUE_UPDATED: 'issue_updated',
  ISSUE_RESOLVED: 'issue_resolved',
  
  // Vote events
  VOTE_UPDATED: 'vote_updated',
  
  // Notification events
  NEW_NOTIFICATION: 'new_notification',
  
  // Analytics events
  ANALYTICS_UPDATE: 'analytics_update',
  
  // Connection events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
} as const;