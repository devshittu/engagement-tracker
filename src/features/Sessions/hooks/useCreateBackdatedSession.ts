// src/features/Sessions/hooks/useCreateBackdatedSession.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { Session } from '@prisma/client';

type CreateBackdatedSessionVariables = {
  type: 'ONE_TO_ONE' | 'GROUP';
  admissionIds: number[];
  activityLogId?: number;
  timeIn: string;
  timeOut?: string;
  groupRef?: string;
  groupDescription?: string; // Added optional group description
};

export const useCreateBackdatedSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateBackdatedSessionVariables) => {
      logger.info('Creating backdated session', variables);
      const response = await apiClient.post(
        '/api/sessions/backdated',
        variables,
      );
      return response.data as Session | Session[];
    },
    onSuccess: (data) => {
      logger.info('Backdated session(s) created successfully', {
        count: Array.isArray(data) ? data.length : 1,
      });
      toast.success('Backdated session(s) created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      logger.error('Failed to create backdated session(s)', {
        error: error.message,
      });
      toast.error(
        error.response?.data?.error || 'Failed to create backdated session(s)',
      );
    },
  });
};
// src/features/Sessions/hooks/useCreateBackdatedSession.ts
