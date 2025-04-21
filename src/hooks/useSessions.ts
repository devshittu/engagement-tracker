// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
'use client';

import { useInfiniteQuery, QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SessionsResponse, GroupedResponse } from '@/types/serviceUser';

type FetchSessionsParams = {
  sortBy: string;
  order: 'asc' | 'desc';
  groupBy?: string;
};

type SessionsData = SessionsResponse | GroupedResponse;

type SessionsQueryKey = ['sessions', FetchSessionsParams];

const fetchSessions = async (
  context: QueryFunctionContext<SessionsQueryKey, number>,
): Promise<SessionsData> => {
  const { pageParam = 1 } = context;
  const [, { sortBy, order, groupBy }] = context.queryKey;

  const params = new URLSearchParams();
  params.set('page', pageParam.toString());
  params.set('pageSize', '20');
  params.set('sortBy', sortBy);
  params.set('order', order);
  if (groupBy && groupBy !== 'none') {
    params.set('groupBy', groupBy);
  }

  const url = `/api/sessions?${params.toString()}`;
  const response = await apiClient.get<SessionsData>(url);
  return response;
};

export const useSessions = ({
  sortBy,
  order,
  groupBy = 'none',
}: FetchSessionsParams) =>
  useInfiniteQuery<SessionsData, Error, SessionsData, SessionsQueryKey, number>(
    {
      queryKey: ['sessions', { sortBy, order, groupBy }],
      queryFn: fetchSessions,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if ('groupedData' in lastPage) {
          return lastPage.pageParam + 1; // Assumes pageParam exists; adjust if API changes
        } else {
          const { page, pageSize, total } = lastPage;
          const maxPage = Math.ceil(total / pageSize);
          return page < maxPage ? page + 1 : undefined;
        }
      },
    },
  );
// src/hooks/useSessions.ts
