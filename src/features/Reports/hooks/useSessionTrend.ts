// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/hooks/useSessionTrend.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TrendReportResponse, Period } from '../types/sessionTrend';

type UseSessionTrendParams = {
  period?: Period;
  compareTo?: 'last' | 'custom';
  customDate?: string;
};

export const useSessionTrend = ({
  period = 'week',
  compareTo,
  customDate,
}: UseSessionTrendParams = {}) => {
  const queryKey = ['sessionTrend', { period, compareTo, customDate }];

  return useQuery<TrendReportResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      if (compareTo) params.set('compareTo', compareTo);
      if (customDate) params.set('customDate', customDate);

      const response = await apiClient.get<TrendReportResponse>(
        `/api/reports/sessions/trend?${params.toString()}`,
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  });
};
