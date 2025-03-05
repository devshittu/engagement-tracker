import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Session } from '@/types/serviceUser';

export type ActiveSessionsResponse = {
  sessions: Session[];
  total?: number; // Optional total count, if needed
};

export type UseActiveSessionsParams = {
  sortBy?: string;
  order?: 'asc' | 'desc';
};

// Provide default values for parameters
export const useActiveSessions = ({
  sortBy = 'timeIn',
  order = 'asc',
}: UseActiveSessionsParams = {}) => {
  return useQuery<ActiveSessionsResponse, Error>({
    queryKey: ['activeSessions', { sortBy, order }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('sortBy', sortBy);
      params.set('order', order);
      const { data } = await axios.get<ActiveSessionsResponse>(
        `/api/sessions/active?${params.toString()}`,
      );
      return data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
// src/features/Sessions/hooks/useActiveSessions.ts
