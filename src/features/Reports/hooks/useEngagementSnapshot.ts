'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { EngagementSnapshotResponse } from '../types/engagementSnapshot';

type UseEngagementSnapshotParams = {
  period?: string;
  startDate?: string;
};

export const useEngagementSnapshot = ({
  period = 'month',
  startDate,
}: UseEngagementSnapshotParams) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.set('startDate', startDate);

  return useQuery<EngagementSnapshotResponse, Error>({
    queryKey: ['engagementSnapshot', { period, startDate }],
    queryFn: async () => {
      const url = `/api/reports/engagement/snapshot?${params.toString()}`;
      console.log('useEngagementSnapshot: Fetching from', url);
      const response = await apiClient.get(url);
      console.log('useEngagementSnapshot: API Response', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};
// src/features/Reports/hooks/useEngagementSnapshot.ts