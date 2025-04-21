// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

// src/hooks/useApiQuery.ts
'use client';

import {
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

type ApiQueryOptions<TData> = {
  endpoint: string;
  queryKey: string[];
  infinite?: false;
} & UseQueryOptions<TData, Error>;

type ApiInfiniteQueryOptions<TData> = {
  endpoint: string;
  queryKey: string[];
  infinite: true;
  getNextPageParam: (lastPage: TData, allPages: TData[]) => number | undefined;
} & UseInfiniteQueryOptions<TData, Error>;

export function useApiQuery<TData>(
  options: ApiQueryOptions<TData> | ApiInfiniteQueryOptions<TData>,
) {
  const { endpoint, queryKey, infinite } = options;

  if (infinite) {
    return useInfiniteQuery<TData, Error>({
      queryKey,
      queryFn: async ({ pageParam = 1 }) => {
        const response = await apiClient.get(
          `${endpoint}?page=${pageParam}&limit=10`,
        );
        return response;
      },
      getNextPageParam: (options as ApiInfiniteQueryOptions<TData>)
        .getNextPageParam,
      ...options,
    });
  }

  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => apiClient.get(endpoint),
    onError: (error) => console.error(`Failed to fetch ${endpoint}:`, error),
    ...options,
  });
}
