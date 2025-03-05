import { MINUTE } from '@/config/constants';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      throwOnError: true,

      gcTime: Infinity,
      // gcTime: 10 * MINUTE,
      // staleTime: 5 * MINUTE, // Data is considered stale after 5 minutes
    },
    mutations: {
      // You can customize mutation behaviors similarly
      retry: 1, // Retry failed mutations once
      retryDelay: (attemptIndex) => 1000 * attemptIndex, // Linear backoff for retries
    },
  },
});

// Path: src/lib/react-query.ts
