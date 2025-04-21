// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

// src/features/activities/components/ActivityBank.tsx

'use client';

import { useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDraggable } from '@dnd-kit/core';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Activity, Department } from '../types';

type ActivityBankProps = {
  activities: Activity[];
  activeActivityIds: Set<number>;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isLoading: boolean;
  departments: Department[];
  selectedDepartmentId?: number;
  onDepartmentChange: (departmentId?: number) => void;
};

export const ActivityBank: React.FC<ActivityBankProps> = ({
  activities,
  activeActivityIds,
  fetchNextPage,
  hasNextPage,
  isLoading,
  departments,
  selectedDepartmentId,
  onDepartmentChange,
}) => {
  const { user } = useAuth();
  const userRoleLevel = user?.roles?.level ?? 0;

  const { ref: observerRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isLoading) {
        fetchNextPage();
      }
    },
  });

  const handleDepartmentChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onDepartmentChange(value === 'all' ? undefined : parseInt(value));
    },
    [onDepartmentChange],
  );

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => a.name.localeCompare(b.name));
  }, [activities]);

  return (
    <div className="flex-1 p-4 bg-base-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Activity Bank</h2>

      {userRoleLevel >= 4 && (
        <div className="mb-4">
          <label
            htmlFor="department-filter"
            className="block text-sm font-medium mb-1"
          >
            Filter by Department
          </label>
          <select
            id="department-filter"
            value={selectedDepartmentId ?? 'all'}
            onChange={handleDepartmentChange}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && activities.length === 0 ? (
        <div className="text-center">Loading activities...</div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {sortedActivities.map((activity) => (
            <ActivityBankItem
              key={activity.id}
              activity={activity}
              isActive={activeActivityIds.has(activity.id)}
            />
          ))}
          {hasNextPage && (
            <div ref={observerRef} className="text-center py-2">
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type ActivityBankItemProps = {
  activity: Activity;
  isActive: boolean;
};

const ActivityBankItem: React.FC<ActivityBankItemProps> = ({
  activity,
  isActive,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `activityBank-${activity.id}`,
    data: { activity, source: 'activityBank' },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded cursor-move transition-opacity ${
        isActive ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <p className="font-medium">{activity.name}</p>
      {activity.department && (
        <p className="text-sm text-gray-500">{activity.department.name}</p>
      )}
    </div>
  );
};
