'use client';

import React from 'react';
import Modal from '@/components/Modal/Modal';
import SessionForm from '@/features/Sessions/ui/SessionForm';

type Admission = {
  id: number;
  serviceUser: { id: number; name: string };
};

type Activity = {
  id: number;
  name: string;
};

type CreateSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: number;
  admissions: Admission[];
  activities: Activity[];
  onSessionCreated?: () => void;
};

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedUserId,
  admissions,
  activities,
  onSessionCreated,
}) => {
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
          activities={activities.map((a) => ({ id: a.id, name: a.name }))} // Ensure only active activities are passed (assuming activities are pre-filtered)
          onSessionCreated={onSessionCreated}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
};

export default CreateSessionModal;
