"use client";
import { useState } from "react";
import { getVoterFingerprint, markIssueVoted } from "@/lib/utils";

interface Props {
  issueId: string; voteCount: number; hasVoted: boolean;
  disabled?: boolean; size?: "sm"|"md";
  onVoteSuccess?: (n: number) => void; onError?: (m: string) => void;
}

export default function VoteButton({ issueId, voteCount, hasVoted: initVoted, disabled, size = "md", onVoteSuccess, onError }: Props) {
  const [voted, setVoted] = useState(initVoted);
  const [count, setCount] = useState(voteCount);
  const [loading, setLoading] = useState(false);
  const sm = size === "sm";

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted || loading || disabled) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterFingerprint: getVoterFingerprint() }),
      });
      const data = await res.json();
      if (!res.ok) { onError?.(data.error || "Failed"); if (res.status === 409) { setVoted(true); markIssueVoted(issueId); } return; }
      setCount(data.voteCount); setVoted(true); markIssueVoted(issueId); onVoteSuccess?.(data.voteCount);
    } catch { onError?.("Network error"); } finally { setLoading(false); }
  };

  return (
    <button onClick={handleVote} disabled={voted || loading || disabled} title={voted ? "Already voted" : "Vote"}
      className={`flex flex-col items-center gap-0.5 rounded-xl transition-all duration-200 ${sm ? "px-2 py-1.5" : "px-3 py-2"} ${voted ? "bg-blue-50 text-blue-600 border border-blue-200 cursor-default" : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"} ${loading ? "opacity-60" : ""}`}>
      <svg className={sm ? "w-4 h-4" : "w-5 h-5"} viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={voted ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span className={`font-semibold tabular-nums ${sm ? "text-xs" : "text-sm"}`}>{count}</span>
    </button>
  );
}
