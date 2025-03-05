import { useInfiniteQuery, QueryFunctionContext } from '@tanstack/react-query';
import axios from 'axios';
import {
  Session,
  SessionsResponse,
  GroupedResponse,
} from '@/types/serviceUser';

type FetchSessionsParams = {
  sortBy: string;
  order: 'asc' | 'desc';
  groupBy?: string; // e.g. "timeIn" or "admissionId" or "none"
};

// The return type can be EITHER SessionsResponse or GroupedResponse
// We'll store them in a union if you want to unify them
type SessionsData = SessionsResponse | GroupedResponse;

type SessionsQueryKey = ['sessions', FetchSessionsParams];

const fetchSessions = async (
  context: QueryFunctionContext<SessionsQueryKey, number>,
): Promise<SessionsData> => {
  const { pageParam = 1, queryKey } = context;
  const [, { sortBy, order, groupBy }] = queryKey;

  // Build query string
  const params = new URLSearchParams();
  params.set('page', pageParam.toString());
  params.set('pageSize', '20');
  params.set('sortBy', sortBy);
  params.set('order', order);
  if (groupBy && groupBy !== 'none') {
    params.set('groupBy', groupBy);
  }

  const response = await axios.get<SessionsData>(
    `/api/sessions?${params.toString()}`,
  );
  return response.data;
};

export const useSessions = ({
  sortBy,
  order,
  groupBy = 'none',
}: FetchSessionsParams) =>
  useInfiniteQuery<
    SessionsData, // TData
    Error, // TError
    SessionsData, // TQueryData
    SessionsQueryKey, // TQueryKey
    number // TPageParam
  >({
    queryKey: ['sessions', { sortBy, order, groupBy }],
    queryFn: fetchSessions,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Check if lastPage is aggregator or normal
      if ('groupedData' in lastPage) {
        // aggregator approach
        // we only have pageParam => no concept of "total pages"
        // you could return undefined or implement your own aggregator
        return lastPage.pageParam + 1; // or undefined if no more pages
      } else {
        // normal approach => SessionsResponse
        const { page, pageSize, total } = lastPage;
        const maxPage = Math.ceil(total / pageSize);
        return page < maxPage ? page + 1 : undefined;
      }
    },
  });

// src/hooks/useSessions.ts
