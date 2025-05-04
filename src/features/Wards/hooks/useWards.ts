// src/features/Wards/hooks/useWards.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Ward } from '@prisma/client';

const log = (message: string, data?: any) => {
  console.log(
    `[useWards] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );
};

export const useWards = () => {
  const queryClient = useQueryClient();

  const { data: wards = [], isLoading } = useQuery<Ward[], Error>({
    queryKey: ['wards'],
    queryFn: async () => {
      log('Initiating API call to /api/wards');
      try {
        const response = await apiClient.get<Ward[]>('/api/wards');
        log('Raw API response', response);

        // Handle case where response might be the array directly or wrapped in { data: [...] }
        const wardsData = Array.isArray(response)
          ? response
          : (response?.data ?? []);

        log('Processed wards data', wardsData);
        if (!Array.isArray(wardsData)) {
          log('Invalid response format after processing', wardsData);
          throw new Error('Invalid API response: expected array of wards');
        }
        return wardsData;
      } catch (error) {
        log('API call failed', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 3000),
  });

  const createWard = useMutation({
    mutationFn: (name: string) => apiClient.post('/api/wards', { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wards'] }),
  });

  const updateWard = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiClient.put(`/api/wards/${id}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wards'] }),
  });

  const deleteWard = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/wards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wards'] }),
  });

  return {
    wards,
    isLoading,
    createWard,
    updateWard,
    deleteWard,
  };
};
// src/features/Wards/hooks/useWards.ts
