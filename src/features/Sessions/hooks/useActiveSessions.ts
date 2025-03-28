// src/features/Sessions/hooks/useActiveSessions.ts

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SessionsResponse, Session } from '@/types/serviceUser';

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

type ActiveSessionsResponse = SessionsResponse | GroupedSessionsResponse;

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
  const response = await apiClient.get<ActiveSessionsResponse>(url);
  return response;
};

export const useActiveSessions = ({
  sortBy,
  order,
  type,
  groupByGroupRef,
}: FetchParams) =>
  useQuery<ActiveSessionsResponse, Error>({
    queryKey: ['activeSessions', { sortBy, order, type, groupByGroupRef }],
    queryFn: () => fetchActiveSessions({ sortBy, order, type, groupByGroupRef }),
    staleTime: 1000 * 60,
  });

export const useActiveSessionsCounts = () => {
  const oneToOne = useQuery<SessionsResponse, Error>({
    queryKey: ['activeSessionsCount', 'ONE_TO_ONE'],
    queryFn: () =>
      fetchActiveSessions({
        sortBy: 'timeIn',
        order: 'asc',
        type: 'ONE_TO_ONE',
      }),
    staleTime: 1000 * 60,
  });

  const group = useQuery<GroupedSessionsResponse, Error>({
    queryKey: ['activeSessionsCount', 'GROUP'],
    queryFn: () =>
      fetchActiveSessions({
        sortBy: 'timeIn',
        order: 'asc',
        type: 'GROUP',
        groupByGroupRef: true,
      }),
    staleTime: 1000 * 60,
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
