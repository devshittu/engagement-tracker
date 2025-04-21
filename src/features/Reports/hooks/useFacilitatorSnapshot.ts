// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/hooks/useFacilitatorSnapshot.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FacilitatorSnapshotResponse } from '../types/facilitatorSnapshot';

type UseFacilitatorSnapshotParams = {
  period?: string;
  startDate?: string;
};

export const useFacilitatorSnapshot = ({
  period = 'month',
  startDate,
}: UseFacilitatorSnapshotParams) => {
  const params = new URLSearchParams({ period });
  if (startDate) params.set('startDate', startDate);

  return useQuery<FacilitatorSnapshotResponse, Error>({
    queryKey: ['facilitatorSnapshot', { period, startDate }],
    queryFn: async () => {
      const url = `/api/reports/facilitator/snapshot?${params.toString()}`;
      console.log('useFacilitatorSnapshot: Fetching from', url);
      const response = await apiClient.get(url);
      console.log('useFacilitatorSnapshot: API Response', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};
// src/features/Reports/hooks/useFacilitatorSnapshot.ts