'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import {
  AdminDashboardData,
  CategoryStat,
  DailyIssueStat,
  UrgencyStat,
  StatusStat,
} from '@/types';
import { getErrorMessage } from '@/lib/utils';

interface AnalyticsData {
  issuesByCategory: CategoryStat[];
  issuesByStatus: StatusStat[];
  issuesByUrgency: UrgencyStat[];
  dailyIssues: DailyIssueStat[];
  topAreas: Array<{ _id: string; count: number; avgVotes: number }>;
  engagementStats: {
    totalVotes?: number;
    totalComments?: number;
    totalViews?: number;
    avgPriorityScore?: number;
  };
}

interface UseDashboardReturn {
  dashboardData: AdminDashboardData | null;
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  isAnalyticsLoading: boolean;
  error: string | null;
  analyticsPeriod: number;
  setAnalyticsPeriod: (period: number) => void;
  refreshDashboard: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

export const useAdminAnalytics = (): UseDashboardReturn => {
  const [dashboardData, setDashboardData] =
    useState<AdminDashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(30);

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getDashboard();
      setDashboardData(response.data.data as AdminDashboardData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    setIsAnalyticsLoading(true);
    try {
      const response = await adminApi.getAnalytics({ period: analyticsPeriod });
      setAnalyticsData(response.data.data as AnalyticsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [analyticsPeriod]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    dashboardData,
    analyticsData,
    isLoading,
    isAnalyticsLoading,
    error,
    analyticsPeriod,
    setAnalyticsPeriod,
    refreshDashboard,
    refreshAnalytics,
  };
};