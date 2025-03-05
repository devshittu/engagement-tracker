// src/app/activities/page.tsx

import ItemsSection from '@/components/Blocks/ItemsSection';
import { prisma } from '@/lib/prisma';
import { Activity } from '@/types/serviceUser';

// This is an async server component that fetches activities data
export default async function ActivitiesPage() {
  // Fetch activities from your database and convert dates to strings
  const activities: Activity[] = (await prisma.activity.findMany()).map(
    (activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt?.toISOString() || null,
    }),
  );

  // Set default view mode (we only pass a value, no function)
  const viewMode: 'grid' | 'list' = 'grid';

  return (
    <ItemsSection items={activities} viewMode={viewMode} title="Activities">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 border rounded bg-base-100 text-base-content"
          >
            <h3 className="font-bold">{activity.name}</h3>
            {activity.createdAt && (
              <p className="text-sm">
                Created on: {new Date(activity.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </ItemsSection>
  );
}
