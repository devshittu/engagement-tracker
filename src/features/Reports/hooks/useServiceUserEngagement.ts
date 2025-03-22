// src/features/Reports/hooks/useServiceUserEngagement.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ServiceUserEngagementResponse } from '../types/serviceUserEngagement';

type UseServiceUserEngagementParams = {
  serviceUserId: string;
  period?: 'day' | 'week' | 'month';
  admissionId?: string;
};

export const useServiceUserEngagement = ({
  serviceUserId,
  period = 'week',
  admissionId,
}: UseServiceUserEngagementParams) => {
  console.log('useServiceUserEngagement: Initiating fetch', {
    serviceUserId,
    period,
    admissionId,
  });

  const queryKey = [
    'serviceUserEngagement',
    { serviceUserId, period, admissionId },
  ];

  return useQuery<ServiceUserEngagementResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (admissionId) params.set('admissionId', admissionId);
      const url = `/api/reports/service-users/${serviceUserId}/engagement?${params.toString()}`;
      console.log('useServiceUserEngagement: Fetching from', url);
      const response = await apiClient.get(url);
      console.log('useServiceUserEngagement: API Response', response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
    enabled: !!serviceUserId,
  });
};
