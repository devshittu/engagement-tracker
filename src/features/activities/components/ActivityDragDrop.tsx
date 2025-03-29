// src/features/activities/components/ActivityDragDrop.tsx

'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { ActivityBank } from './ActivityBank';
import { GoingForward } from './GoingForward';
import { ConfirmationModal } from './ConfirmationModal';
import { Activity, BatchActivateInput, Department } from '../types';
import { useActivityMutations } from '../hooks/useActivityMutations';

type ActivityDragDropProps = {
  allActivities: Activity[];
  activeActivities: Activity[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isLoadingActivities: boolean;
  departments: Department[];
  selectedDepartmentId?: number;
  onDepartmentChange: (departmentId?: number) => void;
};

export const ActivityDragDrop: React.FC<ActivityDragDropProps> = ({
  allActivities,
  activeActivities,
  fetchNextPage,
  hasNextPage,
  isLoadingActivities,
  departments,
  selectedDepartmentId,
  onDepartmentChange,
}) => {
  const { batchActivateActivities, isBatchActivating } = useActivityMutations();
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);
  const [goingForward, setGoingForward] =
    useState<Activity[]>(activeActivities);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const activeActivityIds = useMemo(
    () => new Set(goingForward.map((a) => a.id)),
    [goingForward],
  );

  const hasChanges = useMemo(() => {
    const originalIds = new Set(activeActivities.map((a) => a.id));
    const currentIds = new Set(goingForward.map((a) => a.id));
    return (
      originalIds.size !== currentIds.size ||
      ![...originalIds].every((id) => currentIds.has(id))
    );
  }, [activeActivities, goingForward]);

  const toContinue = useMemo(() => {
    const originalIds = new Set(activeActivities.map((a) => a.id));
    return goingForward.filter((activity) => !originalIds.has(activity.id));
  }, [activeActivities, goingForward]);

  const toDiscontinue = useMemo(() => {
    const currentIds = new Set(goingForward.map((a) => a.id));
    return activeActivities.filter((activity) => !currentIds.has(activity.id));
  }, [activeActivities, goingForward]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.activity) {
      setDraggedActivity(data.current.activity);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!draggedActivity || !over) {
        setDraggedActivity(null);
        return;
      }

      const source = active.data.current?.source;
      const destination = over.id;

      if (source === 'activityBank' && destination === 'goingForward') {
        setGoingForward((prev) => [...prev, draggedActivity]);
      } else if (source === 'goingForward' && destination === 'activityBank') {
        setGoingForward((prev) =>
          prev.filter((a) => a.id !== draggedActivity.id),
        );
      }

      setDraggedActivity(null);
    },
    [draggedActivity],
  );

  const handleSave = useCallback(() => {
    const inputs: BatchActivateInput[] = [
      ...toContinue.map((activity) => ({
        activityId: activity.id,
        activate: true,
      })),
      ...toDiscontinue.map((activity) => ({
        activityId: activity.id,
        activate: false,
      })),
    ];

    if (inputs.length > 0) {
      batchActivateActivities(inputs, {
        onSuccess: () => {
          setShowConfirmation(false);
        },
      });
    }
  }, [toContinue, toDiscontinue, batchActivateActivities]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        <div id="activityBank" className="flex-1">
          <ActivityBank
            activities={allActivities}
            activeActivityIds={activeActivityIds}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoadingActivities}
            departments={departments}
            selectedDepartmentId={selectedDepartmentId}
            onDepartmentChange={onDepartmentChange}
          />
        </div>
        <div id="goingForward" className="flex-1">
          <GoingForward activities={goingForward} />
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={!hasChanges || isBatchActivating}
          className="btn btn-primary btn-lg"
        >
          {isBatchActivating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <DragOverlay>
        {draggedActivity ? (
          <div className="p-3 border rounded bg-white shadow">
            <p className="font-medium">{draggedActivity.name}</p>
            {draggedActivity.department && (
              <p className="text-sm text-gray-500">
                {draggedActivity.department.name}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>
      <ConfirmationModal
        show={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSave}
        toContinue={toContinue}
        toDiscontinue={toDiscontinue}
      />
    </DndContext>
  );
};

// src/features/activities/components/ActivityDragDrop.tsx