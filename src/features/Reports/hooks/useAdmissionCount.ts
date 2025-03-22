// src/features/Reports/hooks/useAdmissionCount.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AdmissionCountResponse } from '../types/admissionCount';

type UseAdmissionCountParams = {
  departmentId?: number;
  wardId?: number;
};

export const useAdmissionCount = ({
  departmentId,
  wardId,
}: UseAdmissionCountParams = {}) => {
  const queryKey = ['admissionCount', { departmentId, wardId }];
  console.log('useAdmissionCount: Initiating fetch', { queryKey });

  return useQuery<AdmissionCountResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set('departmentId', departmentId.toString());
      if (wardId) params.set('wardId', wardId.toString());
      const url = `/api/reports/admissions/count?${params.toString()}`;
      console.log('useAdmissionCount: Fetching from', url);
      const response = await apiClient.get(url);
      console.log('useAdmissionCount: API Response', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};
