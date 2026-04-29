"use client";
import { useState } from "react";
import { Issue } from "@/types";
import { categoryColors, categoryIcons, categoryLabels, formatTimeAgo, truncate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import VoteButton from "./VoteButton";
import Badge from "@/components/ui/Badge";

interface Props {
  issue: Issue;
  onClick?: (i: Issue) => void;
  onVoteSuccess?: (id: string, n: number) => void;
  index?: number;
}

export default function IssueCard({ issue, onClick, onVoteSuccess, index = 0 }: Props) {
  const [voteError, setVoteError] = useState<string | null>(null);
  const color = categoryColors[issue.category] ?? "#6b7280";

  // guard the entire location object — some old DB docs may be malformed
  const lat = issue?.location?.lat ?? 0;
  const lng = issue?.location?.lng ?? 0;
  const address = issue?.location?.address ?? "";

  const locationText =
    address.trim().length > 0
      ? truncate(address, 45)
      : lat !== 0 && lng !== 0
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : "Location not set";

  const imageCount = issue?.images?.length ?? 0;

  return (
    <div
      onClick={() => onClick?.(issue)}
      className={[
        "group bg-white rounded-2xl border border-slate-200 p-5",
        "hover:shadow-md hover:border-slate-300 transition-all duration-200",
        onClick ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        {/* vote button */}
        <div className="flex-shrink-0">
          <VoteButton
            issueId={issue._id}
            voteCount={issue.voteCount ?? 0}
            hasVoted={issue.hasVoted || false}
            disabled={issue.status === "resolved"}
            onVoteSuccess={(n) => onVoteSuccess?.(issue._id, n)}
            onError={setVoteError}
          />
        </div>

        {/* main content */}
        <div className="flex-1 min-w-0">
          {/* badges row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {categoryIcons[issue.category] ?? "📌"} {categoryLabels[issue.category] ?? "Other"}
            </span>
            <StatusBadge status={issue.status} />
            {(issue.priorityScore ?? 0) > 50 && (
              <Badge variant="danger">🔥 High Priority</Badge>
            )}
          </div>

          {/* title */}
          <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-1.5 group-hover:text-blue-700 transition-colors">
            {truncate(issue.title ?? "Untitled Issue", 100)}
          </h3>

          {/* description */}
          <p className="text-slate-500 text-sm leading-relaxed mb-3">
            {truncate(issue.description ?? "", 160)}
          </p>

          {/* meta row */}
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span>📍 {locationText}</span>
            <span>🕐 {formatTimeAgo(issue.createdAt)}</span>
            <span>👤 {issue.reporterName ?? "Anonymous"}</span>
            {imageCount > 0 && (
              <span>
                🖼️ {imageCount} photo{imageCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* vote error message */}
      {voteError && (
        <p className="mt-2 text-xs text-red-500 ml-14">{voteError}</p>
      )}

      {/* priority score bar */}
      <div className="mt-4 ml-14">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Priority Score</span>
          <span className="font-medium text-slate-600">
            {(issue.priorityScore ?? 0).toFixed(1)}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(((issue.priorityScore ?? 0) / 100) * 100, 100)}%`,
              background:
                (issue.priorityScore ?? 0) > 50
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : (issue.priorityScore ?? 0) > 25
                  ? "linear-gradient(90deg, #f59e0b, #eab308)"
                  : "linear-gradient(90deg, #3b82f6, #6366f1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
