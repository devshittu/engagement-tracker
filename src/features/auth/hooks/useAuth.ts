import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type AuthUser = {
  id: string;
  email: string;
  departments: { id: number; name: string };
  roles: { id: number; name: string; level: number };
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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log('useAuth: getSession result:', {
        session: session?.user?.id,
        error: sessionError?.message,
      });

      if (sessionError || !session?.user) {
        // Attempt to refresh the session if it’s missing
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        console.log('useAuth: refreshSession result:', {
          user: refreshData?.user?.id,
          error: refreshError?.message,
        });

        if (refreshError || !refreshData.session) {
          console.log(
            'useAuth: No session found after refresh:',
            refreshError?.message || sessionError?.message,
          );
          // Clear both cookies to ensure the user is fully logged out
          document.cookie =
            'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie =
            'supabase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          // Sign out from Supabase to clear the session
          await supabase.auth.signOut();
          return null;
        }
        session = refreshData.session;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, departments (id, name), roles (id, name, level)')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('useAuth: Profile fetch error:', profileError.message);
        return null;
      }

      console.log('useAuth: Fetched auth user:', profile);
      return profile as AuthUser;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessionError)
          throw new Error(
            'useAuth: Failed to set session:',
            sessionError.message,
          );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      console.error('useAuth: Login error:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      document.cookie =
        'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie =
        'supabase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    },
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
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
