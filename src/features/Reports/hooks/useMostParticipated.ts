// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

// src/features/Reports/hooks/useMostParticipated.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MostParticipatedResponse } from '../types/mostParticipated';

type UseMostParticipatedParams = {
  year?: number;
  month?: number;
};

export const useMostParticipated = ({
  year,
  month,
}: UseMostParticipatedParams = {}) => {
  const queryKey = ['mostParticipated', { year, month }];

  return useQuery<MostParticipatedResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.set('year', year.toString());
      if (month) params.set('month', month.toString());

      const response = await apiClient.get<MostParticipatedResponse>(
        `/api/reports/sessions/most-participated?${params.toString()}`,
      );
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  });
};
