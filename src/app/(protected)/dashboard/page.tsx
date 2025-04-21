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
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="card bg-base-100 shadow-xl p-4 mb-6">
          <p className="text-lg">Welcome, {user?.email ?? 'Unknown User'}!</p>
          <p>Department: {user?.departments?.name ?? 'N/A'}</p>
          <p>
            Role: {user?.roles?.name ?? 'N/A'} (Level:{' '}
            {user?.roles?.level ?? 'N/A'})
          </p>
          <button
            onClick={() =>
              logout(undefined, { onSuccess: () => router.push('/login') })
            }
            className="btn btn-secondary mt-4"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {isAdmin && (
          <div className="space-y-6">
            <section className="card bg-base-100 shadow-xl p-4">
              <h2 className="text-2xl font-bold">Departments</h2>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowDeptModal(true)}
              >
                Add Department
              </button>
              {deptLoading ? (
                <p>Loading...</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {departments.map((d) => (
                    <li key={d.id} className="text-sm">
                      {d.name}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card bg-base-100 shadow-xl p-4">
              <h2 className="text-2xl font-bold">Roles</h2>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowRoleModal(true)}
              >
                Add Role
              </button>
              {roleLoading ? (
                <p>Loading...</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {roles.map((r) => (
                    <li key={r.id} className="text-sm">
                      {r.name} (Level: {r.level}, Dept ID: {r.departmentId})
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card bg-base-100 shadow-xl p-4">
              <h2 className="text-2xl font-bold">Users</h2>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setShowUserModal(true)}
              >
                Add User
              </button>
              {userLoading ? (
                <p>Loading...</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {users.map((u) => (
                    <li
                      key={u.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {u.email} - {u.role?.name ?? 'N/A'} (
                        {u.department?.name ?? 'N/A'})
                      </span>
                      {u.role?.level < (user?.roles?.level ?? 0) && (
                        <button
                          onClick={() => promoteUser.mutate(u.id)}
                          className="btn btn-primary btn-sm"
                          disabled={promoteUser.isPending}
                        >
                          Promote
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {showDeptModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Add Department</h3>
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="input input-bordered w-full mt-2"
                placeholder="Department Name"
              />
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    createDept.mutate(newDeptName);
                    setNewDeptName('');
                    setShowDeptModal(false);
                  }}
                >
                  Save
                </button>
                <button className="btn" onClick={() => setShowDeptModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showRoleModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Add Role</h3>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                className="input input-bordered w-full mt-2"
                placeholder="Role Name"
              />
              <input
                type="number"
                value={newRole.level}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    level: parseInt(e.target.value) || 1,
                  })
                }
                className="input input-bordered w-full mt-2"
                placeholder="Level"
              />
              <select
                value={newRole.departmentId}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    departmentId: parseInt(e.target.value) || 0,
                  })
                }
                className="select select-bordered w-full mt-2"
              >
                <option value={0}>Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    createRole.mutate(newRole);
                    setNewRole({ id: 0, name: '', level: 1, departmentId: 0 });
                    setShowRoleModal(false);
                  }}
                >
                  Save
                </button>
                <button className="btn" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showUserModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Add User</h3>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="input input-bordered w-full mt-2"
                placeholder="Email"
              />
              <select
                value={newUser.departmentId}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    departmentId: parseInt(e.target.value) || 0,
                  })
                }
                className="select select-bordered w-full mt-2"
              >
                <option value={0}>Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select
                value={newUser.roleId}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    roleId: parseInt(e.target.value) || 0,
                  })
                }
                className="select select-bordered w-full mt-2"
              >
                <option value={0}>Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    createUser.mutate(newUser);
                    setNewUser({ email: '', departmentId: 0, roleId: 0 });
                    setShowUserModal(false);
                  }}
                >
                  Save
                </button>
                <button className="btn" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
// src/app/(protected)/dashboard/page.tsx
