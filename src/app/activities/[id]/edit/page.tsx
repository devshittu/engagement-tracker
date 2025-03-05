import { prisma } from '@/lib/prisma';
import EditActivityForm from './EditActivityForm';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EditActivityPage({ params }: Params) {
  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return <p>Invalid activity ID.</p>;
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    return <p>Activity not found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Activity</h1>
      <EditActivityForm activity={activity} />
    </div>
  );
}
