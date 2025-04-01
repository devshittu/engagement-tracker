// src/features/Sessions/hooks/useDeclineSession.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { DeclineReason } from '../types';

const fetchDeclineReasons = async (): Promise<DeclineReason[]> => {
  const response: DeclineReason[] = await apiClient.get('/api/decline-reasons');
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
  const response = await apiClient.post(`/api/sessions/${sessionId}/decline`, {
    declineReasonId,
    description,
  });
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
    onSuccess: () => {
      toast.success('Session declined successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
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