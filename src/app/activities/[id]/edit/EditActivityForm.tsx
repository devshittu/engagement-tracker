'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Activity = {
  id: number;
  name: string;
};

type Props = {
  activity: Activity;
};

export default function EditActivityForm({ activity }: Props) {
  const [name, setName] = useState(activity.name);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/activities/${activity.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/activities');
    } else {
      console.error('Failed to update activity');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="activity-name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="activity-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Update Activity
      </button>
    </form>
  );
}
