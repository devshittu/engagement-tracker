import { prisma } from '@/lib/prisma';
import DeleteActivityForm from './DeleteActivityForm';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function DeleteActivityPage({ params }: Params) {
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
      <h1 className="text-2xl font-bold mb-4">Delete Activity</h1>
      <DeleteActivityForm activity={activity} />
    </div>
  );
}
