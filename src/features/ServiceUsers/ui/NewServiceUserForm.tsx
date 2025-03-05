// components/NewServiceUserForm.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceUserStatus } from '@/types/serviceUser';

const NewServiceUserForm: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [wardId, setWardId] = useState<number | ''>('');
  const [status, setStatus] = useState<ServiceUserStatus>('admitted');
  const [wards, setWards] = useState<{ id: number; name: string }[]>([]);

  // Fetch wards on mount
  useEffect(() => {
    const fetchWards = async () => {
      const res = await fetch('/api/wards');
      if (res.ok) {
        const data = await res.json();
        setWards(data);
      } else {
        console.error('Failed to fetch wards.');
      }
    };
    fetchWards();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (wardId === '') {
      alert('Please select a ward.');
      return;
    }

    const res = await fetch('/api/serviceUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, wardId, status }),
    });

    if (res.ok) {
      router.push('/serviceUsers');
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to add serviceUser.');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 shadow-md rounded-lg"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="wardId"
            className="block text-sm font-medium text-gray-700"
          >
            Ward:
          </label>
          <select
            id="wardId"
            value={wardId}
            onChange={(e) => setWardId(Number(e.target.value))}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Ward</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status:
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceUserStatus)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="admitted">Admitted</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add ServiceUser
        </button>
      </form>
    </>
  );
};

export default NewServiceUserForm;
// src/app/serviceUsers/new/NewServiceUserForm.tsx
