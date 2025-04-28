// src/features/Dashboard/hooks/useDashboard.ts
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDepartments } from './useDepartments';
import { useRoles } from './useRoles';
import { useUsers } from './useUsers';
import { useWards } from './useWards';

export const useDashboard = () => {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const {
    departments,
    isLoading: isDeptLoading,
    ...deptMutations
  } = useDepartments();
  const { roles, isLoading: isRoleLoading, ...roleMutations } = useRoles();
  const { users, isLoading: isUserLoading, ...userMutations } = useUsers();
  const { wards, isLoading: isWardLoading, ...wardMutations } = useWards();

  const isLoading =
    isAuthLoading ||
    isDeptLoading ||
    isRoleLoading ||
    isUserLoading ||
    isWardLoading;

  return {
    user,
    departments,
    roles,
    users,
    wards,
    isLoading,
    logout,
    ...deptMutations,
    ...roleMutations,
    ...userMutations,
    ...wardMutations,
  };
};
// src/features/Dashboard/hooks/useDashboard.ts
