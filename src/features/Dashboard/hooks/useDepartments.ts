// src/features/Dashboard/hooks/useDepartments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Department } from '@prisma/client';

export const useDepartments = () => {
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => await apiClient.get('/api/departments'),
    staleTime: 5 * 60 * 1000,
  });

  const createDepartment = useMutation({
    mutationFn: (name: string) => apiClient.post('/api/departments', { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ['departments'] });
      const previous = queryClient.getQueryData<Department[]>(['departments']);
      queryClient.setQueryData<Department[]>(['departments'], (old = []) => [
        ...old,
        { id: Date.now(), name, createdAt: new Date(), updatedAt: null },
      ]);
      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['departments'], context?.previous);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiClient.put(`/api/departments/${id}`, { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  const deleteDepartment = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/departments/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
// src/features/Dashboard/hooks/useDepartments.ts
