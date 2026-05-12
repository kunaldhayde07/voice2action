import { create } from 'zustand';
import { Issue, IssueFilters, PaginatedData } from '@/types';
import { issuesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface IssueState {
  issues: Issue[];
  myIssues: Issue[];
  selectedIssue: Issue | null;
  pagination: PaginatedData<Issue>['pagination'] | null;
  myPagination: PaginatedData<Issue>['pagination'] | null;
  filters: IssueFilters;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  votedIssueIds: Set<string>;
  mapIssues: Issue[];

  // Actions
  fetchIssues: (filters?: IssueFilters, append?: boolean) => Promise<void>;
  fetchMyIssues: (params?: IssueFilters) => Promise<void>;
  fetchIssueById: (id: string) => Promise<Issue | null>;
  fetchMapIssues: (params?: Record<string, string | number>) => Promise<void>;
  setFilters: (filters: Partial<IssueFilters>) => void;
  resetFilters: () => void;
  setSelectedIssue: (issue: Issue | null) => void;
  updateIssueLocally: (issueId: string, updates: Partial<Issue>) => void;
  addIssueLocally: (issue: Issue) => void;
  removeIssueLocally: (issueId: string) => void;
  setVotedIssues: (ids: string[]) => void;
  toggleVotedLocally: (issueId: string) => void;
  clearError: () => void;
}

const DEFAULT_FILTERS: IssueFilters = {
  status: '',
  category: '',
  urgency: '',
  search: '',
  sort: '-priorityScore',
  page: 1,
  limit: 10,
};

export const useIssueStore = create<IssueState>()((set, get) => ({
  issues: [],
  myIssues: [],
  selectedIssue: null,
  pagination: null,
  myPagination: null,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  votedIssueIds: new Set(),
  mapIssues: [],

  fetchIssues: async (filters, append = false) => {
    const currentFilters = { ...get().filters, ...filters };

    set({
      isLoading: !append,
      isLoadingMore: append,
      error: null,
    });

    try {
      const params = Object.fromEntries(
        Object.entries(currentFilters).filter(
          ([, v]) => v !== undefined && v !== null && v !== ''
        )
      ) as Record<string, string | number>;

      const response = await issuesApi.getAll(params);
      const result = response.data.data as PaginatedData<Issue>;

      set((state) => ({
        issues: append ? [...state.issues, ...result.data] : result.data,
        pagination: result.pagination,
        filters: currentFilters,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        isLoadingMore: false,
        error: getErrorMessage(error),
      });
    }
  },

  fetchMyIssues: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issuesApi.getMyIssues(
        params as Record<string, string | number | undefined>
      );
      const result = response.data.data as PaginatedData<Issue>;
      set({
        myIssues: result.data,
        myPagination: result.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  fetchIssueById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issuesApi.getById(id);
      const issue = response.data.data.issue as Issue;
      set({ selectedIssue: issue, isLoading: false });
      return issue;
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return null;
    }
  },

  fetchMapIssues: async (params) => {
    try {
      const response = await issuesApi.getMapIssues(params);
      set({ mapIssues: response.data.data.issues });
    } catch {
      // Silently fail for map
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  setSelectedIssue: (issue) => {
    set({ selectedIssue: issue });
  },

  updateIssueLocally: (issueId, updates) => {
    set((state) => ({
      issues: state.issues.map((issue) =>
        issue._id === issueId ? { ...issue, ...updates } : issue
      ),
      myIssues: state.myIssues.map((issue) =>
        issue._id === issueId ? { ...issue, ...updates } : issue
      ),
      selectedIssue:
        state.selectedIssue?._id === issueId
          ? { ...state.selectedIssue, ...updates }
          : state.selectedIssue,
      mapIssues: state.mapIssues.map((issue) =>
        issue._id === issueId ? { ...issue, ...updates } : issue
      ),
    }));
  },

  addIssueLocally: (issue) => {
    set((state) => ({
      issues: [issue, ...state.issues],
      myIssues: [issue, ...state.myIssues],
    }));
  },

  removeIssueLocally: (issueId) => {
    set((state) => ({
      issues: state.issues.filter((i) => i._id !== issueId),
      myIssues: state.myIssues.filter((i) => i._id !== issueId),
    }));
  },

  setVotedIssues: (ids) => {
    set({ votedIssueIds: new Set(ids) });
  },

  toggleVotedLocally: (issueId) => {
    set((state) => {
      const newSet = new Set(state.votedIssueIds);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return { votedIssueIds: newSet };
    });
  },

  clearError: () => set({ error: null }),
}));