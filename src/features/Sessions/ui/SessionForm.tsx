'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

type ServiceUser = {
  id: number;
  name: string;
};

type Admission = {
  id: number;
  serviceUser: ServiceUser;
};

type Activity = {
  id: number;
  name: string;
};

type SessionFormProps = {
  preselectedUserId?: number;
  admissions?: Admission[];
  activities: Activity[];
  onSessionCreated?: () => void;
  onClose?: () => void;
};

const SessionForm: React.FC<SessionFormProps> = ({
  preselectedUserId,
  admissions,
  activities,
  onSessionCreated,
  onClose,
}) => {
  const router = useRouter();

  const [admissionId, setAdmissionId] = useState<number | ''>('');
  const [activityId, setActivityId] = useState<number | ''>('');
  const [errors, setErrors] = useState<{
    admissionId?: string;
    activityId?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);

  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);

  useEffect(() => {
    if (admissions && preselectedUserId) {
      const userAdmissions = admissions.filter(
        (adm) => adm.serviceUser.id === preselectedUserId,
      );
      setFilteredAdmissions(userAdmissions);
      if (userAdmissions.length === 1) {
        setAdmissionId(userAdmissions[0].id);
      }
    } else if (admissions) {
      setFilteredAdmissions(admissions);
    } else {
      setFilteredAdmissions([]);
    }
  }, [admissions, preselectedUserId]);

  const validateForm = () => {
    const newErrors: { admissionId?: string; activityId?: string } = {};
    if (admissionId === '')
      newErrors.admissionId = 'Please select a service user.';
    if (activityId === '') newErrors.activityId = 'Please select an activity.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startSession = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ONE_TO_ONE',
          admissionId,
          activityLogId: activityId,
        }),
      });

      if (response.ok) {
        toast.success('Session started successfully!');
        onSessionCreated?.();
        onClose?.();
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to start session.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={startSession} className="space-y-6">
        <div className="form-control">
          <label className="label" htmlFor="admissionId">
            <span className="label-text font-medium text-gray-900 dark:text-gray-100">
              Select Service User (Admission)
            </span>
          </label>
          <select
            name="admissionId"
            id="admissionId"
            value={admissionId}
            onChange={(e) => {
              setAdmissionId(Number(e.target.value));
              setErrors((prev) => ({ ...prev, admissionId: undefined }));
            }}
            className={`select select-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.admissionId ? 'border-red-500' : ''}`}
            disabled={
              filteredAdmissions.length === 1 && preselectedUserId !== undefined
            }
          >
            <option value="">Choose an Admission</option>
            {filteredAdmissions.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.serviceUser.name} (admission #{adm.id})
              </option>
            ))}
          </select>
          {errors.admissionId && (
            <p className="text-red-500 text-sm mt-1">{errors.admissionId}</p>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="activityId">
            <span className="label-text font-medium text-gray-900 dark:text-gray-100">
              Select Activity
            </span>
          </label>
          <select
            name="activityId"
            id="activityId"
            value={activityId}
            onChange={(e) => {
              setActivityId(Number(e.target.value));
              setErrors((prev) => ({ ...prev, activityId: undefined }));
            }}
            className={`select select-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.activityId ? 'border-red-500' : ''}`}
          >
            <option value="">Choose an Activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
          {errors.activityId && (
            <p className="text-red-500 text-sm mt-1">{errors.activityId}</p>
          )}
        </div>

        <div className="form-control mt-4">
          <button
            type="submit"
            className={`btn w-full bg-teal-500 hover:bg-teal-600 text-white ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              'Start Session'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;
// src/app/sessions/new/SessionForm.tsx
