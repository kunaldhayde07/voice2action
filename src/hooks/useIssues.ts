import { useState, useEffect, useCallback } from "react";
import { Issue, FilterState } from "@/types";
import { hasVotedOnIssue } from "@/lib/utils";

const defaultFilters: FilterState = {
  category: "all",
  status: "all",
  sortBy: "priority",
  searchQuery: "",
};

export function useIssues(initialFilters: Partial<FilterState> = {}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, ...initialFilters });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchIssues = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: page.toString(), limit: "20", sortBy: filters.sortBy });
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.searchQuery.trim()) params.set("search", filters.searchQuery);
      const res = await fetch(`/api/issues?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load issues");
      const data = await res.json();
      setIssues(data.issues.map((issue: Issue) => ({ ...issue, hasVoted: hasVotedOnIssue(issue._id) })));
      setPagination({ total: data.pagination.total, page: data.pagination.page, pages: data.pagination.pages });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchIssues(1), filters.searchQuery ? 400 : 0);
    return () => clearTimeout(debounce);
  }, [fetchIssues]);

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateIssueVoteCount = useCallback((issueId: string, voteCount: number) => {
    setIssues((prev) => prev.map((issue) => issue._id === issueId ? { ...issue, voteCount, hasVoted: true } : issue));
  }, []);

  const addNewIssue = useCallback((issue: Issue) => {
    setIssues((prev) => [{ ...issue, hasVoted: false }, ...prev]);
  }, []);

  const updateIssueStatus = useCallback((issueId: string, status: Issue["status"]) => {
    setIssues((prev) => prev.map((issue) => issue._id === issueId ? { ...issue, status } : issue));
  }, []);

  return { issues, loading, error, filters, pagination, updateFilter, updateIssueVoteCount, addNewIssue, updateIssueStatus, refetch: fetchIssues };
}
