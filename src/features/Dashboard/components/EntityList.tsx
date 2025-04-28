// src/features/Dashboard/components/EntityList.tsx
'use client';
import { DashboardEntity, DashboardUser } from '../types';
import { Button } from '@/components/Buttons/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Department, Role, Ward } from '@prisma/client';

interface EntityListProps {
  entities: DashboardEntity[];
  entityType: 'Department' | 'Role' | 'User' | 'Ward';
  onEdit: (entity: DashboardEntity) => void;
  onDelete: (entity: DashboardEntity) => void;
  onPromote?: (user: DashboardUser) => void;
  isLoading: boolean;
}

export const EntityList: React.FC<EntityListProps> = ({
  entities,
  entityType,
  onEdit,
  onDelete,
  onPromote,
  isLoading,
}) => {
  const { user } = useAuth();

  if (isLoading) {
    return <div className="animate-pulse">Loading {entityType}s...</div>;
  }

  if (entities.length === 0) {
    return <p>No {entityType}s found.</p>;
  }

  return (
    <ul className="space-y-2">
      {entities.map((entity) => (
        <li
          key={'id' in entity ? entity.id : entityType}
          className="flex justify-between items-center p-2 bg-base-200 rounded"
        >
          <span>
            {entityType === 'User'
              ? `${(entity as DashboardUser).email} - ${
                  (entity as DashboardUser).role.name
                } (${(entity as DashboardUser).department.name})`
              : entityType === 'Role'
                ? `${(entity as Role).name} (Level: ${
                    (entity as Role).level
                  }, Dept ID: ${(entity as Role).departmentId})`
                : (entity as Department | Ward).name}
          </span>
          <div className="space-x-2">
            <Button
              onClick={() => onEdit(entity)}
              className="btn btn-primary btn-sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(entity)}
              className="btn btn-error btn-sm"
            >
              Delete
            </Button>
            {entityType === 'User' &&
              (user?.roles?.[0]?.level ?? 0) >
                (entity as DashboardUser).role.level && (
                <Button
                  onClick={() => onPromote?.(entity as DashboardUser)}
                  className="btn btn-accent btn-sm"
                >
                  Promote
                </Button>
              )}
          </div>
        </li>
      ))}
    </ul>
  );
};
// src/features/Dashboard/components/EntityList.tsx
