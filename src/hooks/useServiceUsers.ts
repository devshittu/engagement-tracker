import {
  useInfiniteQuery,
  QueryFunctionContext,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import {
  ServiceUserStatus,
  ServiceUser,
  ServiceUsersResponse,
} from '@/types/serviceUser';

type UseServiceUsersParams = {
  statusFilter: ServiceUserStatus;
  sortBy: string;
  order: 'asc' | 'desc';
  groupByWard: boolean;
};
// A tuple where the first element is the query name,
// and the second element is an object with your filter/sort properties.
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
}: UseServiceUsersParams): UseInfiniteQueryResult<ServiceUsersResponse, Error> {
  // Construct a typed query key.
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
    // The queryFn receives a typed context, including `pageParam`.
    queryFn: async (
      context: QueryFunctionContext<ServiceUsersQueryKey, number>,
    ) => {
      // Destructure pageParam with a default of 1
      const { pageParam = 1, queryKey } = context;

      // Extract your filters/sort options from the second tuple element
      const [, { statusFilter, sortBy, order, groupByWard }] = queryKey;

      // Build the request parameters
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

      // Fetch data using axios
      const response = await axios.get<ServiceUsersResponse>(
        `/api/serviceUsers?${params.toString()}`,
      );

      return response.data;
    },
    // The initial page to fetch
    initialPageParam: 1,
    // Determine the next page param
    getNextPageParam: (lastPage) => {
      const { page, pageSize, total } = lastPage;
      const maxPage = Math.ceil(total / pageSize);
      return page < maxPage ? page + 1 : undefined;
    },
  });
}
// src/hooks/useServiceUsers.ts
