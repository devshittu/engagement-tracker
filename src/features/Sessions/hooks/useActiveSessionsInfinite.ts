// import { useInfiniteQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { Session } from '@/types/serviceUser';

// export type ActiveSessionsResponse = {
//   sessions: Session[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// export type UseActiveSessionsParams = {
//   sortBy?: string;
//   order?: 'asc' | 'desc';
// };

// export const useActiveSessionsInfinite = ({
//   sortBy = 'timeIn',
//   order = 'asc',
// }: UseActiveSessionsParams = {}) => {
//   return useInfiniteQuery<ActiveSessionsResponse, Error>({
//     queryKey: ['activeSessionsInfinite', { sortBy, order }],
//     queryFn: async ({ pageParam = 1 }) => {
//       const params = new URLSearchParams();
//       params.set('sortBy', sortBy);
//       params.set('order', order);
//       params.set('page', pageParam.toString());
//       params.set('pageSize', '20');
//       const { data } = await axios.get<ActiveSessionsResponse>(
//         `/api/sessions/active?${params.toString()}`
//       );
//       return data;
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => {
//       const { page, pageSize, total } = lastPage;
//       const maxPage = Math.ceil(total / pageSize);
//       return page < maxPage ? page + 1 : undefined;
//     },
//     refetchInterval: 10000, // Auto-refetch every 10 seconds
//   });
// };
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
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
    ActiveSessionsResponse, // TData
    Error, // TError
    ActiveSessionsResponse, // TQueryData
    [string, UseActiveSessionsParams], // TQueryKey
    number // TPageParam (here we specify that pageParam is a number)
  >({
    queryKey: ['activeSessionsInfinite', { sortBy, order }],
    queryFn: async ({ pageParam = 1, queryKey }) => {
      const params = new URLSearchParams();
      params.set('sortBy', sortBy);
      params.set('order', order);
      params.set('page', pageParam.toString());
      params.set('pageSize', '20');
      const { data } = await axios.get<ActiveSessionsResponse>(
        `/api/sessions/active?${params.toString()}`,
      );
      return data;
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
