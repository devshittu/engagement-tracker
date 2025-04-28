// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/app/(protected)/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react'; // Added useEffect
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import ActiveSessionsDashboard from '@/features/Sessions/ui/dashboard/ActiveSessionsDashboard';
import SearchServiceUsers from '@/features/ServiceUsers/ui/SearchServiceUsers';
import { logger } from '@/lib/logger'; // Added logger
import { DashboardLayout } from '@/features/Dashboard/components/DashboardLayout';

interface Department {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Role {
  id: number;
  name: string;
  level: number;
  departmentId: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiUser {
  id: string;
  email: string;
  department: Department;
  role: Role;
  departmentId?: number;
  roleId?: number;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string | null;
}

export default function DashboardPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const queryClient = useQueryClient();

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newRole, setNewRole] = useState<Role>({
    id: 0,
    name: '',
    level: 1,
    departmentId: 0,
  });
  const [newUser, setNewUser] = useState({
    email: '',
    departmentId: 0,
    roleId: 0,
  });

  const { data: departments = [], isLoading: deptLoading } = useQuery<
    Department[]
  >({
    queryKey: ['departments'],
    queryFn: async () => await apiClient.get('/api/departments'),
    enabled:
      !!user &&
      (user?.roles?.level >= 4 || user?.roles?.name === 'Super Admin'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: roles = [], isLoading: roleLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => await apiClient.get('/api/roles'),
    enabled:
      !!user &&
      (user?.roles?.level >= 4 || user?.roles?.name === 'Super Admin'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: users = [], isLoading: userLoading } = useQuery<ApiUser[]>({
    queryKey: ['users'],
    queryFn: async () => await apiClient.get('/api/users'),
    enabled:
      !!user &&
      (user?.roles?.level >= 4 || user?.roles?.name === 'Super Admin'),
    staleTime: 5 * 60 * 1000,
  });

  const createDept = useMutation({
    mutationFn: (name: string) => apiClient.post('/api/departments', { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ['departments'] });
      const previous = queryClient.getQueryData<Department[]>(['departments']);
      queryClient.setQueryData<Department[]>(['departments'], (old = []) => [
        ...old,
        { id: Date.now(), name },
      ]);
      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['departments'], context?.previous);
    },
  });

  const createRole = useMutation({
    mutationFn: (data: { name: string; level: number; departmentId: number }) =>
      apiClient.post('/api/roles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const createUser = useMutation({
    mutationFn: (data: {
      email: string;
      departmentId: number;
      roleId: number;
    }) => apiClient.post('/api/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const promoteUser = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/users/${id}/promote`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const isAdmin =
    user?.roles?.level >= 4 || user?.roles?.name === 'Super Admin';

  // Debug parent render
  useEffect(() => {
    logger.debug('DashboardPage rendered', { user: user?.email, isAdmin });
  }, [user, isAdmin]);

  return (
    <>
      <ActiveSessionsDashboard />
      <SearchServiceUsers />
      <DashboardLayout />
    </>
  );
}
// src/app/(protected)/dashboard/page.tsx
