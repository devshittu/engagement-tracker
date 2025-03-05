'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

// Data types
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

// Props for the form
type SessionFormProps = {
  // If provided, we only want to allow picking from the preselected user's admissions
  preselectedUserId?: number;
  // If the parent already has admissions (active) list, pass it
  admissions?: Admission[];
  activities: Activity[];
  // Callback after a successful session creation
  onSessionCreated?: () => void;
  // Callback to close the modal or form
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

  // Local state for form fields
  const [admissionId, setAdmissionId] = useState<number | ''>('');
  const [activityId, setActivityId] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Filter admissions based on preselected user if provided
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);

  useEffect(() => {
    if (admissions && preselectedUserId) {
      const userAdmissions = admissions.filter(
        (adm) => adm.serviceUser.id === preselectedUserId,
      );
      setFilteredAdmissions(userAdmissions);
      // Auto-select if exactly one admission exists
      if (userAdmissions.length === 1) {
        setAdmissionId(userAdmissions[0].id);
      }
    } else if (admissions) {
      setFilteredAdmissions(admissions);
    } else {
      setFilteredAdmissions([]);
    }
  }, [admissions, preselectedUserId]);

  const startSession = async (e: FormEvent) => {
    e.preventDefault();
    if (admissionId === '' || activityId === '') {
      toast.error(
        'Please select both a service user (admission) and an activity.',
      );
      return;
    }

    setLoading(true);
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId, activityId }),
    });
    setLoading(false);

    if (response.ok) {
      toast.success('Session started successfully!');
      onSessionCreated?.();
      onClose?.();
      // Optionally redirect:
      // router.push('/sessions');
    } else {
      toast.error('Failed to start session.');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* <h2 className="text-lg font-semibold mb-4">Start a New Session</h2> */}
      <form onSubmit={startSession} className="space-y-4">
        {/* Service User (Admission) Select */}
        <div className="form-control">
          <label className="label" htmlFor="admissionId">
            <span className="label-text font-medium">
              Select Service User (Admission)
            </span>
          </label>
          <select
            name="admissionId"
            id="admissionId"
            value={admissionId}
            onChange={(e) => setAdmissionId(Number(e.target.value))}
            required
            className="select select-bordered w-full"
            // Optionally disable if only one option is available
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
        </div>

        {/* Activity Select */}
        <div className="form-control">
          <label className="label" htmlFor="activityId">
            <span className="label-text font-medium">Select Activity</span>
          </label>
          <select
            name="activityId"
            id="activityId"
            value={activityId}
            onChange={(e) => setActivityId(Number(e.target.value))}
            required
            className="select select-bordered w-full"
          >
            <option value="">Choose an Activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="form-control mt-4">
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
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
