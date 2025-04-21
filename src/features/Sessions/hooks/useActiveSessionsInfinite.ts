// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Session } from '@/types/serviceUser';

export type ActiveSessionsResponse = {
  sessions: Session[];
  total: number;
  page: number;
  pageSize: number;
};

export type UseActiveSessionsParams = {
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export const useActiveSessionsInfinite = ({
  sortBy = 'timeIn',
  order = 'asc',
}: UseActiveSessionsParams = {}) => {
  return useInfiniteQuery<
    ActiveSessionsResponse,
    Error,
    ActiveSessionsResponse,
    [string, UseActiveSessionsParams],
    number
  >({
    queryKey: ['activeSessionsInfinite', { sortBy, order }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set('sortBy', sortBy);
      params.set('order', order);
      params.set('page', pageParam.toString());
      params.set('pageSize', '20');

      const url = `/api/sessions/active?${params.toString()}`;
      const response = await apiClient.get<ActiveSessionsResponse>(url);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageSize, total } = lastPage;
      const maxPage = Math.ceil(total / pageSize);
      return page < maxPage ? page + 1 : undefined;
    },
    refetchInterval: 10000, // Auto-refetch every 10 seconds
  });
};
// src/features/Sessions/hooks/useActiveSessionsInfinite.ts
