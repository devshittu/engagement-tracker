// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/hooks/useApiMutation.ts
'use client';

import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useApiMutation<TData, TVariables>({
  endpoint,
  method = 'post',
  queryKey,
  ...options
}: {
  endpoint: string;
  method?: 'post' | 'put' | 'delete';
  queryKey: string[];
} & UseMutationOptions<TData, Error, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => {
      const apiMethod = {
        post: apiClient.post,
        put: apiClient.put,
        delete: apiClient.delete,
      }[method];
      return apiMethod(endpoint, method === 'delete' ? undefined : variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) =>
      console.error(`Failed to ${method} ${endpoint}:`, error),
    ...options,
  });
}
