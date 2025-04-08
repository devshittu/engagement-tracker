'use client';

import React from 'react';
import Modal from '@/components/Modal/Modal';
import SessionForm from '@/features/Sessions/ui/SessionForm';
import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';

type CreateSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: number;
  onSessionCreated?: () => void;
};

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedUserId,
  onSessionCreated,
}) => {
  const { data: admissions = [], isLoading: isAdmissionsLoading } = useActiveAdmissions();
  const { data: activities = [], isLoading: isActivitiesLoading } = useActiveActivities();

  if (isAdmissionsLoading || isActivitiesLoading) {
    return <div>Loading admissions and activities...</div>;
  }

  return (
    <Modal show={isOpen} handleClose={onClose} ariaLabel="Create Session">
      <div className="p-4 flex justify-between items-center bg-teal-500 text-white rounded-t-lg">
        <h3 className="text-xl font-bold">Create One-to-One Session</h3>
        <button className="btn btn-sm btn-ghost text-xl" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="p-4">
        <SessionForm
          preselectedUserId={preselectedUserId}
          admissions={admissions}
          activities={activities}
          onSessionCreated={onSessionCreated}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
};

export default CreateSessionModal;
// src/features/Sessions/ui/CreateSessionModal.tsx