import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  departmentId: number;
  roles: { id: number; name: string; level: number }; // Changed from array to single object
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('useAuth: getSession result:', { session: session?.user?.id, error: sessionError?.message });

      if (sessionError || !session?.user) {
        console.log('useAuth: No session found:', sessionError?.message);
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, name, email, departmentId, roles (id, name, level)')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('useAuth: Profile fetch error:', profileError.message);
        return null;
      }

      // Since Supabase returns roles as an array, we take the first (and only) role
      const userProfile: AuthUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        departmentId: profile.departmentId,
        roles: profile.roles[0], // Adjust for Supabase's array response
      };

      console.log('useAuth: Fetched auth user:', userProfile);
      return userProfile;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
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
