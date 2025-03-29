// src/app/(protected)/activities/page.tsx

'use client';

import { useState } from 'react';
import { ActivityDragDrop } from '@/features/activities/components/ActivityDragDrop';
import { CreateActivityModal } from '@/features/activities/components/CreateActivityModal';
import { EditActivityModal } from '@/features/activities/components/EditActivityModal';
import { DeleteActivityModal } from '@/features/activities/components/DeleteActivityModal';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { Activity } from '@/features/activities/types';
import { EditButton } from '@/components/Buttons/EditButton';
import { PlusButton } from '@/components/Buttons/PlusButton';

export default function ActivitiesPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | undefined
  >(undefined);
  const {
    activities,
    activeActivities,
    fetchNextPage,
    hasNextPage,
    isLoadingActivities,
    departments,
  } = useActivities(selectedDepartmentId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<Activity | null>(null);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Activities</h1>
        <PlusButton
          onClick={() => setShowCreateModal(true)}
          ariaLabel="Create new activity"
        />
      </div>

      <div className="mb-6">
        <ActivityDragDrop
          allActivities={activities}
          activeActivities={activeActivities}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoadingActivities={isLoadingActivities}
          departments={departments}
          selectedDepartmentId={selectedDepartmentId}
          onDepartmentChange={setSelectedDepartmentId}
        />
      </div>

      <div className="bg-base-100 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">All Activities</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.name}</td>
                  <td>{activity.department?.name ?? 'Generic'}</td>
                  <td>
                    <div className="flex gap-2">
                      <EditButton
                        onClick={() => setEditActivity(activity)}
                        ariaLabel={`Edit ${activity.name}`}
                      />
                      <button
                        onClick={() => setDeleteActivity(activity)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateActivityModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        departments={departments}
      />
      <EditActivityModal
        show={!!editActivity}
        onClose={() => setEditActivity(null)}
        activity={editActivity}
        departments={departments}
      />
      <DeleteActivityModal
        show={!!deleteActivity}
        onClose={() => setDeleteActivity(null)}
        activity={deleteActivity}
      />
    </div>
  );
}
// src/app/(protected)/activities/page.tsx