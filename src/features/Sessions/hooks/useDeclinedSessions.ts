// src/features/Sessions/hooks/useDeclinedSessions.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DeclinedSession } from '../types';

const fetchDeclinedSessions = async (): Promise<DeclinedSession[]> => {
  const response: DeclinedSession[] = await apiClient.get(
    '/api/declined-sessions',
  );
  return response;
};

export const useDeclinedSessions = () => {
  return useQuery({
    queryKey: ['declinedSessions'],
    queryFn: fetchDeclinedSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
