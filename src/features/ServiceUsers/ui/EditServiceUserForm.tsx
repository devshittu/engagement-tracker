'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceUser } from '@/types/serviceUser';

type Props = {
  serviceUser: ServiceUser;
};

const EditServiceUserForm: React.FC<Props> = ({ serviceUser }) => {
  const router = useRouter();
  const [name, setName] = useState(serviceUser.name);
  const [wardId, setWardId] = useState<number | ''>(
    serviceUser.admissions?.[0]?.wardId || '',
  );
  const [status, setStatus] = useState<string>(
    serviceUser.admissions?.[0]?.dischargeDate ? 'discharged' : 'admitted',
  );
  const [wards, setWards] = useState<{ id: number; name: string }[]>([]);

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

    const res = await fetch(`/api/serviceUsers/${serviceUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, wardId }),
    });

    if (res.ok) {
      router.push('/serviceUsers');
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to update serviceUser.');
    }
  };

  return (
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
        <input
          type="text"
          id="status"
          value={status}
          readOnly
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Update ServiceUser
      </button>
    </form>
  );
};

export default EditServiceUserForm;

// src/app/serviceUsers/[id]/edit/EditServiceUserForm.tsx
