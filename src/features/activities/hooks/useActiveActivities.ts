'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type ActivityLog = {
  id: number;
  name: string;
  startDate: string;
};

export const useActiveActivities = () => {
  const { user } = useAuth();

  return useQuery<ActivityLog[], Error>({
    queryKey: ['activeActivities'],
    queryFn: async () => {
      const response = await apiClient.get<ActivityLog[]>('/api/activities/active');
      return response.map((log) => ({
        ...log,
        startDate: new Date(log.startDate).toISOString(),
      }));
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 1000 * 60, // 1 minute
  });
};
// src/features/activities/hooks/useActiveActivities.ts