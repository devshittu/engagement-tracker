import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api-client';

export type MostParticipatedResponse = {
  period: { year: number; month: number };
  data: {
    activityId: number;
    count: number;
    activityName: string;
  }[];
  top: {
    activityId: number;
    count: number;
    activityName: string;
  } | null;
};

export type UseMostParticipatedParams = {
  year?: number;
  month?: number;
};

export const useMostParticipatedSessions = ({
  year,
  month,
}: UseMostParticipatedParams = {}) => {
  return useQuery<MostParticipatedResponse, Error>({
    queryKey: ['mostParticipatedSessions', { year, month }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.set('year', year.toString());
      if (month) params.set('month', month.toString());
      const { data } = await apiClient.get<MostParticipatedResponse>(
        `/api/reports/sessions/most-participated?${params.toString()}`,
      );
      return data;
    },
    refetchInterval: 30000, // Auto-refetch every 30 seconds if needed
  });
};
