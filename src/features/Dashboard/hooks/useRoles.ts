// src/features/Dashboard/hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Role } from '@prisma/client';

export const useRoles = () => {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => await apiClient.get('/api/roles'),
    staleTime: 5 * 60 * 1000,
  });

  const createRole = useMutation({
    mutationFn: (data: { name: string; level: number; departmentId: number }) =>
      apiClient.post('/api/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const updateRole = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; level: number; departmentId: number };
    }) => apiClient.put(`/api/roles/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  return {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
  };
};
// src/features/Dashboard/hooks/useRoles.ts
