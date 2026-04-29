export type IssueStatus = "pending" | "in_progress" | "resolved";

export type IssueCategory =
  | "road"
  | "water"
  | "electricity"
  | "garbage"
  | "safety"
  | "parks"
  | "noise"
  | "other";

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: Location;
  status: IssueStatus;
  voteCount: number;
  priorityScore: number;
  reporterName: string;
  reporterEmail?: string;
  images: string[];
  resolvedImage?: string;
  resolvedNote?: string;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
}

export interface WsMessage {
  type: "vote_update" | "new_issue" | "status_update" | "connected" | "pong";
  issueId?: string;
  voteCount?: number;
  issue?: Issue;
  status?: IssueStatus;
  timestamp?: string;
  message?: string;
}

export interface FilterState {
  category: IssueCategory | "all";
  status: IssueStatus | "all";
  sortBy: "priority" | "votes" | "newest" | "oldest";
  searchQuery: string;
}
