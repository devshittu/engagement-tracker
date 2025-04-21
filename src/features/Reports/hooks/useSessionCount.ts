// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/hooks/useSessionCount.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SessionCountResponse, Period } from '../types/sessionCount';

type UseSessionCountParams = {
  period?: Period;
  compareTo?: 'last' | 'custom';
  customDate?: string;
  groupBy?: 'admissionId' | 'activityLogId';
};

export const useSessionCount = ({
  period = 'week',
  compareTo,
  customDate,
  groupBy,
}: UseSessionCountParams = {}) => {
  const queryKey = ['sessionCount', { period, compareTo, customDate, groupBy }];

  return useQuery<SessionCountResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      if (compareTo) params.set('compareTo', compareTo);
      if (customDate) params.set('customDate', customDate);
      if (groupBy) params.set('groupBy', groupBy);

      const response = await apiClient.get<SessionCountResponse>(
        `/api/reports/sessions/count?${params.toString()}`,
      );
      return response; // Already T due to interceptor
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  });
};
