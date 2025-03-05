'use client';

import { useRouter } from 'next/navigation';

type Activity = {
  id: number;
  name: string;
};

type Props = {
  activity: Activity;
};

export default function DeleteActivityForm({ activity }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete ${activity.name}?`,
    );

    if (confirmed) {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/activities');
      } else {
        console.error('Failed to delete activity');
      }
    }
  };

  return (
    <div>
      <p>
        Are you sure you want to delete <strong>{activity.name}</strong>?
      </p>
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Delete Activity
      </button>
    </div>
  );
}
