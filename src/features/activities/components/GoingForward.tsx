// src/features/activities/components/GoingForward.tsx

'use client';

import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Activity } from '../types';

type GoingForwardProps = {
  activities: Activity[];
};

export const GoingForward: React.FC<GoingForwardProps> = ({ activities }) => {
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => a.name.localeCompare(b.name));
  }, [activities]);

  return (
    <div className="flex-1 p-4 bg-base-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Going Forward</h2>
      {activities.length === 0 ? (
        <div className="text-center text-gray-500">
          Drag activities here to continue them.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {sortedActivities.map((activity) => (
            <GoingForwardItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

type GoingForwardItemProps = {
  activity: Activity;
};

const GoingForwardItem: React.FC<GoingForwardItemProps> = ({ activity }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `goingForward-${activity.id}`,
    data: { activity, source: 'goingForward' },
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
      className="p-3 border rounded cursor-move"
    >
      <p className="font-medium">{activity.name}</p>
      {activity.department && (
        <p className="text-sm text-gray-500">{activity.department.name}</p>
      )}
    </div>
  );
};
