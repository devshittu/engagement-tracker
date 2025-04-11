'use client';

import { useInfiniteQuery, QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ServiceUserStatus,
  ServiceUsersResponse,
} from '@/types/serviceUser';

type UseServiceUsersParams = {
  statusFilter: ServiceUserStatus;
  sortBy: string;
  order: 'asc' | 'desc';
  groupByWard: boolean;
};

type ServiceUsersQueryKey = [
  'serviceUsers',
  {
    statusFilter: 'admitted' | 'discharged' | 'all';
    sortBy: string;
    order: 'asc' | 'desc';
    groupByWard: boolean;
  },
];

/**
 * This hook fetches paginated service users with infinite scrolling.
 */
export function useServiceUsers({
  statusFilter,
  sortBy,
  order,
  groupByWard,
}: UseServiceUsersParams) {
  const queryKey: ServiceUsersQueryKey = [
    'serviceUsers',
    { statusFilter, sortBy, order, groupByWard },
  ];

  return useInfiniteQuery<
    ServiceUsersResponse,
    Error,
    ServiceUsersResponse,
    ServiceUsersQueryKey,
    number
  >({
    queryKey,
    queryFn: async (
      context: QueryFunctionContext<ServiceUsersQueryKey, number>,
    ) => {
      const { pageParam = 1 } = context;
      const [, { statusFilter, sortBy, order, groupByWard }] = context.queryKey;

      const params = new URLSearchParams();
      params.set('page', pageParam.toString());
      params.set('pageSize', '20');
      params.set('sortBy', sortBy);
      params.set('order', order);
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (groupByWard) {
        params.set('groupByWard', 'true');
      }

      const url = `/api/service-users?${params.toString()}`;
      const response = await apiClient.get<ServiceUsersResponse>(url);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageSize, total } = lastPage;
      const maxPage = Math.ceil(total / pageSize);
      return page < maxPage ? page + 1 : undefined;
    },
  });
}
// src/hooks/useServiceUsers.ts
