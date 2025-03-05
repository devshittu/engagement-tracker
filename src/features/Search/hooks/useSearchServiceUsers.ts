import { useInfiniteQuery, QueryFunctionContext } from '@tanstack/react-query';
import axios from 'axios';
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
  const { pageParam = 1, queryKey } = context;
  const [, { q, sortBy, order }] = queryKey;

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

  const response = await axios.get<ServiceUsersResponse>(
    `/api/serviceUsers/search?${params.toString()}`,
  );
  return response.data;
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
