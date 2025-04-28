// src/features/Dashboard/types.ts
import { Department, Role, User, Ward } from '@prisma/client';

export type DashboardUser = User & {
  name: string | null;
  department: Department;
  role: Role;
};

export type DashboardEntity = Department | Role | DashboardUser | Ward;

export interface CRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'Department' | 'Role' | 'User' | 'Ward';
  action: 'create' | 'update' | 'delete';
  data?: Partial<DashboardEntity>;
  extraData?: {
    departments?: Department[];
    roles?: Role[];
  };
}
// src/features/Dashboard/types.ts
