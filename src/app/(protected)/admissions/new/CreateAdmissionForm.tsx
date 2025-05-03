// app/admissions/new/CreateAdmissionForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ServiceUser = { id: number; name: string };
type Ward = { id: number; name: string };

export default function CreateAdmissionForm() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [serviceUserId, setServiceUserId] = useState<number>();
  const [wardId, setWardId] = useState<number>();
  const [admissionDate, setAdmissionDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const resUsers = await fetch('/api/service-users');
      const users = await resUsers.json();
      setServiceUsers(users);

      const resWards = await fetch('/api/wards');
      const wards = await resWards.json();
      setWards(wards);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admissions', {
      method: 'POST',
      body: JSON.stringify({ serviceUserId, wardId, admissionDate }),
      headers: { 'Content-Type': 'application/json' },
    });
    router.push('/admissions');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Service User Select */}
      <label htmlFor="serviceUserId">Service User</label>
      <select
        id="serviceUserId"
        value={serviceUserId}
        onChange={(e) => setServiceUserId(Number(e.target.value))}
        required
      >
        <option value="">Select Service User</option>
        {serviceUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* Ward Select */}
      <label htmlFor="wardId">Ward</label>
      <select
        id="wardId"
        value={wardId}
        onChange={(e) => setWardId(Number(e.target.value))}
        required
      >
        <option value="">Select Ward</option>
        {wards.map((ward) => (
          <option key={ward.id} value={ward.id}>
            {ward.name}
          </option>
        ))}
      </select>

      {/* Admission Date */}
      <label htmlFor="admissionDate">Admission Date</label>
      <input
        id="admissionDate"
        type="date"
        value={admissionDate}
        onChange={(e) => setAdmissionDate(e.target.value)}
        required
      />

      <button type="submit">Create Admission</button>
    </form>
  );
}
