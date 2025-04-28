// src/features/Dashboard/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardUser } from '../types';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<DashboardUser[]>({
    queryKey: ['users'],
    queryFn: async () => await apiClient.get('/api/users'),
    staleTime: 5 * 60 * 1000,
  });

  const createUser = useMutation({
    mutationFn: (data: {
      email: string;
      departmentId: number;
      roleId: number;
    }) => apiClient.post('/api/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateUser = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { email: string; departmentId: number; roleId: number };
    }) => apiClient.put(`/api/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const promoteUser = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/users/${id}/promote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    promoteUser,
  };
};
// src/features/Dashboard/hooks/useUsers.ts
