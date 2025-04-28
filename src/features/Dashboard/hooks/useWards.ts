// src/features/Dashboard/hooks/useWards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Ward } from '@prisma/client';

export const useWards = () => {
  const queryClient = useQueryClient();

  const { data: wards = [], isLoading } = useQuery<Ward[]>({
    queryKey: ['wards'],
    queryFn: async () => await apiClient.get('/api/wards'),
    staleTime: 5 * 60 * 1000,
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
// src/features/Dashboard/hooks/useWards.ts
