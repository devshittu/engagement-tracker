// src/features/Sessions/hooks/useDeclineSession.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { DeclineReason } from '../types';
import { logger } from '@/lib/logger';

const fetchDeclineReasons = async (): Promise<DeclineReason[]> => {
  logger.debug('Fetching decline reasons');
  const response: DeclineReason[] = await apiClient.get('/api/decline-reasons');
  logger.info('Decline reasons fetched', { count: response.length });
  return response;
};

const declineSession = async ({
  sessionId,
  declineReasonId,
  description,
}: {
  sessionId: number;
  declineReasonId: number;
  description: string | null;
}) => {
  logger.debug('Declining session', {
    sessionId,
    declineReasonId,
    description,
  });
  const response = await apiClient.post(`/api/sessions/${sessionId}/decline`, {
    declineReasonId,
    description,
  });
  logger.info('Session declined', { sessionId });
  return response;
};

export const useDeclineSession = () => {
  const queryClient = useQueryClient();

  const declineReasonsQuery = useQuery({
    queryKey: ['declineReasons'],
    queryFn: fetchDeclineReasons,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const declineMutation = useMutation({
    mutationFn: declineSession,
    onSuccess: async (_, variables) => {
      logger.info('Decline mutation succeeded', {
        sessionId: variables.sessionId,
      });
      toast.success('Session declined successfully!');

      // Fetch session type to invalidate the correct query
      try {
        const session = await apiClient.get(
          `/api/sessions/${variables.sessionId}`,
        );
        const sessionType = session.type as 'ONE_TO_ONE' | 'GROUP';
        logger.debug('Fetched session type for invalidation', {
          sessionId: variables.sessionId,
          sessionType,
        });

        await queryClient.invalidateQueries({
          queryKey: ['activeSessions', { type: sessionType }],
        });
        logger.info('Invalidated active sessions query', { sessionType });
      } catch (error) {
        logger.error('Failed to fetch session type for invalidation', {
          error,
        });
        // Fallback to invalidate all active sessions if type fetch fails
        await queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        logger.warn('Fallback invalidation triggered for all active sessions');
      }
    },
    onError: (err: any) => {
      logger.error('Decline mutation failed', { error: err.message });
      toast.error(err.message || 'Failed to decline session');
    },
  });

  return {
    declineReasons: declineReasonsQuery.data ?? [],
    isLoadingReasons: declineReasonsQuery.isLoading,
    declineSession: declineMutation.mutate,
    isDeclining: declineMutation.isPending,
  };
};
// src/features/Sessions/hooks/useDeclineSession.ts
