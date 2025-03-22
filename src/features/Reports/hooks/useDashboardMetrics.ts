// src/features/Reports/hooks/useDashboardMetrics.ts
'use client';

import { useQuery, QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardMetricsResponse } from '../types/dashboardMetrics';

type DashboardMetricsQueryKey = ['dashboardMetrics'];

const fetchDashboardMetrics = async (
  _context: QueryFunctionContext<DashboardMetricsQueryKey>,
): Promise<DashboardMetricsResponse> => {
  const response = await apiClient.get<DashboardMetricsResponse>(
    '/api/reports/sessions/metrics/dashboard',
  );
  return response; // apiClient already unwraps AxiosResponse
};

export const useDashboardMetrics = () =>
  useQuery<
    DashboardMetricsResponse,
    Error,
    DashboardMetricsResponse,
    DashboardMetricsQueryKey
  >({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Refresh every 30 seconds
  });
