// src/features/Sessions/hooks/useActiveSessions.ts

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SessionsResponse, Session } from '@/types/serviceUser';
import { logger } from '@/lib/logger';

type FetchParams = {
  sortBy: string;
  order: 'asc' | 'desc';
  type?: 'ONE_TO_ONE' | 'GROUP';
  groupByGroupRef?: boolean;
};

type GroupSession = {
  groupRef: string;
  groupDescription: string;
  count: number;
  sessions: Session[];
};

type GroupedSessionsResponse = {
  groups: GroupSession[];
  total: number;
};

export type ActiveSessionsResponse = SessionsResponse | GroupedSessionsResponse;

const fetchActiveSessions = async ({
  sortBy,
  order,
  type,
  groupByGroupRef,
}: FetchParams): Promise<ActiveSessionsResponse> => {
  const params = new URLSearchParams();
  params.set('sortBy', sortBy);
  params.set('order', order);
  if (type) params.set('type', type);
  if (groupByGroupRef) params.set('groupByGroupRef', 'true');

  const url = `/api/sessions/active?${params.toString()}`;
  logger.debug('Fetching active sessions', { url, type });
  const response = await apiClient.get<ActiveSessionsResponse>(url);
  logger.info('Active sessions fetched', { type, total: response.total });
  return response;
};

export const useActiveSessions = ({
  sortBy,
  order,
  type,
  groupByGroupRef,
}: FetchParams) =>
  useQuery({
    queryKey: ['activeSessions', { sortBy, order, type, groupByGroupRef }],
    queryFn: () =>
      fetchActiveSessions({ sortBy, order, type, groupByGroupRef }),
    staleTime: 1000 * 60,
    select: (data: ActiveSessionsResponse) => data, // Explicitly return data as-is
  });

export const useActiveSessionsCounts = () => {
  const oneToOne = useQuery({
    queryKey: ['activeSessionsCount', { type: 'ONE_TO_ONE' }],
    queryFn: () =>
      fetchActiveSessions({
        sortBy: 'timeIn',
        order: 'asc',
        type: 'ONE_TO_ONE',
      }),
    staleTime: 1000 * 60,
    select: (data: ActiveSessionsResponse) => data as SessionsResponse, // Cast to SessionsResponse
  });

  const group = useQuery({
    queryKey: ['activeSessionsCount', { type: 'GROUP' }],
    queryFn: () =>
      fetchActiveSessions({
        sortBy: 'timeIn',
        order: 'asc',
        type: 'GROUP',
        groupByGroupRef: true,
      }),
    staleTime: 1000 * 60,
    select: (data: ActiveSessionsResponse) => data as GroupedSessionsResponse, // Cast to GroupedSessionsResponse
  });

  return {
    oneToOneCount: oneToOne.data?.total ?? 0,
    groupCount: group.data?.total ?? 0,
    isLoading: oneToOne.isLoading || group.isLoading,
    isError: oneToOne.isError || group.isError,
    error: oneToOne.error || group.error,
  };
};
// src/features/Sessions/hooks/useActiveSessions.ts
