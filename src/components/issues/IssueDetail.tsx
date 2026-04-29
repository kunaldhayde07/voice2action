"use client";
import { useState } from "react";
import { Issue } from "@/types";
import { categoryColors, categoryIcons, categoryLabels, formatTimeAgo } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import VoteButton from "./VoteButton";

interface Props { issue: Issue; onVoteSuccess?: (n: number) => void; onClose?: () => void; }

export default function IssueDetail({ issue, onVoteSuccess, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [voteError, setVoteError] = useState("");
  const color = categoryColors[issue.category];

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                {categoryIcons[issue.category]} {categoryLabels[issue.category]}
              </span>
              <StatusBadge status={issue.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{issue.title}</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <p className="text-slate-700 leading-relaxed text-sm">{issue.description}</p>

        {issue.images?.length > 0 && (
          <div>
            <img src={issue.images[activeImg]} alt="Issue" className="w-full h-52 object-cover rounded-2xl border border-slate-200 mb-2" />
            {issue.images.length > 1 && (
              <div className="flex gap-2">
                {issue.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 object-cover rounded-xl border-2 cursor-pointer ${activeImg === i ? "border-blue-500" : "border-slate-200"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {issue.status === "resolved" && issue.resolvedImage && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <p className="text-emerald-700 font-semibold text-sm mb-3">✓ Proof of Resolution</p>
            <img src={issue.resolvedImage} alt="Proof" className="w-full h-44 object-cover rounded-xl mb-2" />
            {issue.resolvedNote && <p className="text-sm text-emerald-700">{issue.resolvedNote}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-400 mb-1">Location</p>
            <p className="text-sm text-slate-700 font-medium">{issue.location.address || `${issue.location.lat.toFixed(5)}, ${issue.location.lng.toFixed(5)}`}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-400 mb-1">Reported</p>
            <p className="text-sm text-slate-700 font-medium">{formatTimeAgo(issue.createdAt)} by {issue.reporterName}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-400 mb-1">Priority Score</p>
            <p className="text-2xl font-bold text-slate-900">{issue.priorityScore.toFixed(1)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-400 mb-1">Total Votes</p>
            <p className="text-2xl font-bold text-slate-900">{issue.voteCount}</p>
          </div>
        </div>
      </div>

      {issue.status !== "resolved" && (
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4">
            <VoteButton issueId={issue._id} voteCount={issue.voteCount} hasVoted={issue.hasVoted || false} onVoteSuccess={onVoteSuccess} onError={setVoteError} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Vote to prioritize</p>
              <p className="text-xs text-slate-400">More votes = higher priority in the authority queue</p>
            </div>
          </div>
          {voteError && <p className="text-xs text-red-500 mt-2">{voteError}</p>}
        </div>
      )}
    </div>
  );
}
