import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IssueCategory, IssueStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVoterFingerprint(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("v2a_voter_id");
  if (stored) return stored;
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join("|");
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const fingerprint = `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
  localStorage.setItem("v2a_voter_id", fingerprint);
  return fingerprint;
}

export function getVotedIssues(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("v2a_voted_issues");
  return stored ? JSON.parse(stored) : [];
}

export function markIssueVoted(issueId: string): void {
  const voted = getVotedIssues();
  if (!voted.includes(issueId)) {
    voted.push(issueId);
    localStorage.setItem("v2a_voted_issues", JSON.stringify(voted));
  }
}

export function hasVotedOnIssue(issueId: string): boolean {
  return getVotedIssues().includes(issueId);
}

export const categoryLabels: Record<IssueCategory, string> = {
  road: "Road & Traffic",
  water: "Water & Drainage",
  electricity: "Electricity",
  garbage: "Garbage & Waste",
  safety: "Public Safety",
  parks: "Parks & Recreation",
  noise: "Noise Pollution",
  other: "Other",
};

export const categoryColors: Record<IssueCategory, string> = {
  road: "#f59e0b",
  water: "#3b82f6",
  electricity: "#eab308",
  garbage: "#10b981",
  safety: "#ef4444",
  parks: "#22c55e",
  noise: "#8b5cf6",
  other: "#6b7280",
};

export const categoryIcons: Record<IssueCategory, string> = {
  road: "🛣️",
  water: "💧",
  electricity: "⚡",
  garbage: "🗑️",
  safety: "🚨",
  parks: "🌳",
  noise: "🔊",
  other: "📌",
};

export const statusConfig: Record<IssueStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  resolved: { label: "Resolved", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
};

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export function compressBase64(base64: string, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = (height * MAX) / width; width = MAX; }
        else { width = (width * MAX) / height; height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}
