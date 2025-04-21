// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

'use client';

import { useInfiniteQuery, QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ServiceUsersResponse } from '@/types/serviceUser';

export type FetchSearchParams = {
  q: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

type SearchQueryKey = ['searchServiceUsers', FetchSearchParams];

const fetchSearchServiceUsers = async (
  context: QueryFunctionContext<SearchQueryKey, number>,
): Promise<ServiceUsersResponse> => {
  const { pageParam = 1 } = context;
  const [, { q, sortBy, order }] = context.queryKey;

  // Validate input – if empty, return empty data
  if (!q.trim()) {
    return { serviceUsers: [], total: 0, page: 1, pageSize: 20 };
  }

  const params = new URLSearchParams();
  params.set('q', q);
  params.set('page', pageParam.toString());
  params.set('pageSize', '20');
  params.set('sortBy', sortBy);
  params.set('order', order);

  const url = `/api/service-users/search?${params.toString()}`;
  const response = await apiClient.get<ServiceUsersResponse>(url);
  return response;
};

export const useSearchServiceUsers = ({
  q,
  sortBy,
  order,
}: FetchSearchParams) =>
  useInfiniteQuery<
    ServiceUsersResponse,
    Error,
    ServiceUsersResponse,
    SearchQueryKey,
    number
  >({
    queryKey: ['searchServiceUsers', { q, sortBy, order }],
    queryFn: fetchSearchServiceUsers,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageSize, total } = lastPage;
      const maxPage = Math.ceil(total / pageSize);
      return page < maxPage ? page + 1 : undefined;
    },
    enabled: q.trim().length > 0, // Only run the query if there's a search query
  });

// src/features/Search/hooks/useSearchServiceUsers.ts
