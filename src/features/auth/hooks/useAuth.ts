// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  departmentId: number;
  roles: { id: number; name: string; level: number }[];
};

type LoginCredentials = {
  email: string;
  password: string;
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true,
        });
        console.log('useAuth: Fetched auth user:', response.data.user);
        return response.data.user || null;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(
            'useAuth: No user session found:',
            error.response?.status,
          );
        }
        return null;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const response = await axios.post(
        '/api/auth/login',
        { email, password },
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data.user);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error: any) => {
      console.error(
        'useAuth: Login error:',
        error.response?.data?.error || error.message,
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      document.cookie = 'sb-access-token=; Max-Age=0; path=/;';
    },
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error: Error) => {
      console.error('useAuth: Logout error:', error.message);
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
// src/features/auth/hooks/useAuth.ts
