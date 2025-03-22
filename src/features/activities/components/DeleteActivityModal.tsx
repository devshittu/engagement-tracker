// src/features/activities/components/DeleteActivityModal.tsx

'use client';

import { useCallback } from 'react';
import Modal from '@/components/Modal/Modal';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { Activity } from '../types';

type DeleteActivityModalProps = {
  show: boolean;
  onClose: () => void;
  activity: Activity | null;
};

export const DeleteActivityModal: React.FC<DeleteActivityModalProps> = ({
  show,
  onClose,
  activity,
}) => {
  const { deleteActivity, isDeleting } = useActivityMutations();

  const handleDelete = useCallback(() => {
    if (!activity) return;

    deleteActivity(activity.id, {
      onSuccess: () => {
        onClose();
      },
      onError: (error: unknown) => {
        console.error('Failed to delete activity:', error);
        alert('Failed to delete activity. Please try again.');
      },
    });
  }, [activity, deleteActivity, onClose]);

  if (!activity) return null;

  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Delete Activity">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Delete Activity</h2>
        <p className="mb-4">
          Are you sure you want to delete the activity{' '}
          <strong>{activity.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
