'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { logger } from '@/lib/logger';

export type ActivityLog = {
  id: number;
  activityId: number; // Original Activity ID
  name: string;
  startDate: string;
};

export const useActiveActivities = () => {
  const { user } = useAuth();

  return useQuery<ActivityLog[], Error>({
    queryKey: ['activeActivities'],
    queryFn: async () => {
      logger.debug('Fetching active activity logs');
      const response = await apiClient.get<ActivityLog[]>('/api/activities/active');
       const logs = response.map((log) => ({
        ...log,
        startDate: new Date(log.startDate).toISOString(),
      }));
      logger.info('Active activity logs fetched', { count: logs.length });
      return logs;
    },
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 1000 * 60, // 1 minute
  });
};

// src/features/activities/hooks/useActiveActivities.ts