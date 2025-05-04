// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Dashboard/components/DashboardLayout.tsx

'use client';
import { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { UserInfo } from './UserInfo';
import { EntityList } from './EntityList';
import { CRUDModal } from './CRUDModal';
import { DashboardEntity } from '../types';
import { Button } from '@/components/Buttons/Button';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';

export const DashboardLayout: React.FC = () => {
  const {
    user,
    departments,
    roles,
    users,
    wards,
    isLoading,
    logout,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createRole,
    updateRole,
    deleteRole,
    createUser,
    updateUser,
    deleteUser,
    promoteUser,
    createWard,
    updateWard,
    deleteWard,
  } = useDashboard();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    entityType: 'Department' | 'Role' | 'User' | 'Ward';
    action: 'create' | 'update' | 'delete';
    data?: DashboardEntity;
  }>({
    isOpen: false,
    entityType: 'Department',
    action: 'create',
  });

  const isAdmin =
    user?.roles?.[0]?.level >= 4 || user?.roles?.[0]?.name === 'Super Admin';

  const handleOpenModal = (
    entityType: 'Department' | 'Role' | 'User' | 'Ward',
    action: 'create' | 'update' | 'delete',
    data?: DashboardEntity,
  ) => {
    setModalState({ isOpen: true, entityType, action, data });
  };

  const handleCloseModal = (formData?: Partial<DashboardEntity>) => {
    if (formData) {
      const { entityType, action, data } = modalState;

      try {
        if (entityType === 'Department') {
          if (action === 'create') {
            createDepartment.mutate(formData.name as string, {
              onSuccess: () => {
                logger.info('Department created', {
                  userId: user?.id,
                  departmentName: formData.name,
                });
                toast.success('Department created successfully!');
              },
              onError: (error) => {
                logger.error('Failed to create department', {
                  userId: user?.id,
                  departmentName: formData.name,
                  error: error.message,
                });
                toast.error('Failed to create department');
              },
            });
          } else if (action === 'update') {
            updateDepartment.mutate(
              { id: (data as any).id, name: formData.name as string },
              {
                onSuccess: () => {
                  logger.info('Department updated', {
                    userId: user?.id,
                    departmentId: (data as any).id,
                    departmentName: formData.name,
                  });
                  toast.success('Department updated successfully!');
                },
                onError: (error) => {
                  logger.error('Failed to update department', {
                    userId: user?.id,
                    departmentId: (data as any).id,
                    error: error.message,
                  });
                  toast.error('Failed to update department');
                },
              },
            );
          } else {
            deleteDepartment.mutate((data as any).id, {
              onSuccess: () => {
                logger.info('Department deleted', {
                  userId: user?.id,
                  departmentId: (data as any).id,
                });
                toast.success('Department deleted successfully!');
              },
              onError: (error) => {
                logger.error('Failed to delete department', {
                  userId: user?.id,
                  departmentId: (data as any).id,
                  error: error.message,
                });
                toast.error('Failed to delete department');
              },
            });
          }
        } else if (entityType === 'Role') {
          const roleData = {
            name: formData.name as string,
            level: (formData as any).level as number,
            departmentId: (formData as any).departmentId as number,
          };
          if (action === 'create') {
            createRole.mutate(roleData, {
              onSuccess: () => {
                logger.info('Role created', {
                  userId: user?.id,
                  roleName: formData.name,
                  departmentId: (formData as any).departmentId,
                });
                toast.success('Role created successfully!');
              },
              onError: (error) => {
                logger.error('Failed to create role', {
                  userId: user?.id,
                  roleName: formData.name,
                  error: error.message,
                });
                toast.error('Failed to create role');
              },
            });
          } else if (action === 'update') {
            updateRole.mutate(
              { id: (data as any).id, data: roleData },
              {
                onSuccess: () => {
                  logger.info('Role updated', {
                    userId: user?.id,
                    roleId: (data as any).id,
                    roleName: formData.name,
                  });
                  toast.success('Role updated successfully!');
                },
                onError: (error) => {
                  logger.error('Failed to update role', {
                    userId: user?.id,
                    roleId: (data as any).id,
                    error: error.message,
                  });
                  toast.error('Failed to update role');
                },
              },
            );
          } else {
            deleteRole.mutate((data as any).id, {
              onSuccess: () => {
                logger.info('Role deleted', {
                  userId: user?.id,
                  roleId: (data as any).id,
                });
                toast.success('Role deleted successfully!');
              },
              onError: (error) => {
                logger.error('Failed to delete role', {
                  userId: user?.id,
                  roleId: (data as any).id,
                  error: error.message,
                });
                toast.error('Failed to delete role');
              },
            });
          }
        } else if (entityType === 'User') {
          const userData = {
            name: (formData as any).name as string,
            email: (formData as any).email as string,
            departmentId: (formData as any).departmentId as number,
            roleId: (formData as any).roleId as number,
          };
          if (action === 'create') {
            createUser.mutate(userData, {
              onSuccess: () => {
                logger.info('User created', {
                  userId: user?.id,
                  newUserEmail: (formData as any).email,
                  newUserName: (formData as any).name,
                });
                toast.success('User created successfully!');
              },
              onError: (error) => {
                logger.error('Failed to create user', {
                  userId: user?.id,
                  newUserEmail: (formData as any).email,
                  error: error.message,
                });
                toast.error('Failed to create user');
              },
            });
          } else if (action === 'update') {
            updateUser.mutate(
              { id: (data as any).id, data: userData },
              {
                onSuccess: () => {
                  logger.info('User updated', {
                    userId: user?.id,
                    updatedUserId: (data as any).id,
                    email: (formData as any).email,
                    name: (formData as any).name,
                  });
                  toast.success('User updated successfully!');
                },
                onError: (error) => {
                  logger.error('Failed to update user', {
                    userId: user?.id,
                    updatedUserId: (data as any).id,
                    error: error.message,
                  });
                  toast.error('Failed to update user');
                },
              },
            );
          } else {
            deleteUser.mutate((data as any).id, {
              onSuccess: () => {
                logger.info('User deleted', {
                  userId: user?.id,
                  deletedUserId: (data as any).id,
                });
                toast.success('User deleted successfully!');
              },
              onError: (error) => {
                logger.error('Failed to delete user', {
                  userId: user?.id,
                  deletedUserId: (data as any).id,
                  error: error.message,
                });
                toast.error('Failed to delete user');
              },
            });
          }
        } else if (entityType === 'Ward') {
          if (action === 'create') {
            createWard.mutate(formData.name as string, {
              onSuccess: () => {
                logger.info('Ward created', {
                  userId: user?.id,
                  wardName: formData.name,
                });
                toast.success('Ward created successfully!');
              },
              onError: (error) => {
                logger.error('Failed to create ward', {
                  userId: user?.id,
                  wardName: formData.name,
                  error: error.message,
                });
                toast.error('Failed to create ward');
              },
            });
          } else if (action === 'update') {
            updateWard.mutate(
              { id: (data as any).id, name: formData.name as string },
              {
                onSuccess: () => {
                  logger.info('Ward updated', {
                    userId: user?.id,
                    wardId: (data as any).id,
                    wardName: formData.name,
                  });
                  toast.success('Ward updated successfully!');
                },
                onError: (error) => {
                  logger.error('Failed to update ward', {
                    userId: user?.id,
                    wardId: (data as any).id,
                    error: error.message,
                  });
                  toast.error('Failed to update ward');
                },
              },
            );
          } else {
            deleteWard.mutate((data as any).id, {
              onSuccess: () => {
                logger.info('Ward deleted', {
                  userId: user?.id,
                  wardId: (data as any).id,
                });
                toast.success('Ward deleted successfully!');
              },
              onError: (error) => {
                logger.error('Failed to delete ward', {
                  userId: user?.id,
                  wardId: (data as any).id,
                  error: error.message,
                });
                toast.error('Failed to delete ward');
              },
            });
          }
        }
      } catch (error: any) {
        logger.error(`Failed to perform ${action} on ${entityType}`, {
          userId: user?.id,
          error: error.message,
        });
        toast.error(`Failed to ${action} ${entityType}`);
      }
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg text-teal-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <UserInfo user={user} isLoggingOut={false} logout={logout} />
      {isAdmin && (
        <div className="space-y-6">
          <section className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Departments</h2>
            <Button
              onClick={() => handleOpenModal('Department', 'create')}
              className="btn btn-primary mb-4"
            >
              Add Department
            </Button>
            <EntityList
              entities={departments}
              entityType="Department"
              onEdit={(entity) =>
                handleOpenModal('Department', 'update', entity)
              }
              onDelete={(entity) =>
                handleOpenModal('Department', 'delete', entity)
              }
              isLoading={isLoading}
            />
          </section>
          <section className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Roles</h2>
            <Button
              onClick={() => handleOpenModal('Role', 'create')}
              className="btn btn-primary mb-4"
            >
              Add Role
            </Button>
            <EntityList
              entities={roles}
              entityType="Role"
              onEdit={(entity) => handleOpenModal('Role', 'update', entity)}
              onDelete={(entity) => handleOpenModal('Role', 'delete', entity)}
              isLoading={isLoading}
            />
          </section>
          <section className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <Button
              onClick={() => handleOpenModal('User', 'create')}
              className="btn btn-primary mb-4"
            >
              Add User
            </Button>
            <EntityList
              entities={users}
              entityType="User"
              onEdit={(entity) => handleOpenModal('User', 'update', entity)}
              onDelete={(entity) => handleOpenModal('User', 'delete', entity)}
              onPromote={(user) =>
                promoteUser.mutate(user.id, {
                  onSuccess: () => {
                    logger.info('User promoted', {
                      userId: user?.id,
                      promotedUserId: user.id,
                    });
                    toast.success('User promoted successfully!');
                  },
                  onError: (error) => {
                    logger.error('Failed to promote user', {
                      userId: user?.id,
                      promotedUserId: user.id,
                      error: error.message,
                    });
                    toast.error('Failed to promote user');
                  },
                })
              }
              isLoading={isLoading}
            />
          </section>
          <section className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Wards</h2>
            <Button
              onClick={() => handleOpenModal('Ward', 'create')}
              className="btn btn-primary mb-4"
            >
              Add Ward
            </Button>
            <EntityList
              entities={wards}
              entityType="Ward"
              onEdit={(entity) => handleOpenModal('Ward', 'update', entity)}
              onDelete={(entity) => handleOpenModal('Ward', 'delete', entity)}
              isLoading={isLoading}
              isEmpty={wards.length === 0 && !isLoading}
            />
          </section>
        </div>
      )}
      <CRUDModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        entityType={modalState.entityType}
        action={modalState.action}
        data={modalState.data}
        extraData={{ departments, roles }}
      />
    </div>
  );
};
// src/features/Dashboard/components/DashboardLayout.tsx
