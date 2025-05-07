// src/features/Sessions/hooks/useUpdateSessionTimes.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { Session } from '@prisma/client';

export const useUpdateSessionTimes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      timeIn,
      timeOut,
    }: {
      id: number;
      timeIn: string;
      timeOut: string;
    }) => {
      logger.info('Updating session times', { id, timeIn, timeOut });
      const response = await apiClient.patch(
        `/api/sessions/${id}/update-times`,
        { timeIn, timeOut },
      );
      return response.data as Session;
    },
    onSuccess: () => {
      logger.info('Session times updated successfully');
      toast.success('Session times updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      logger.error('Failed to update session times', { error: error.message });
      toast.error(
        error.response?.data?.error || 'Failed to update session times',
      );
    },
  });
};
// src/features/Sessions/hooks/useUpdateSessionTimes.ts
