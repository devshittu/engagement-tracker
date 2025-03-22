// src/features/activities/components/ConfirmationModal.tsx

'use client';

import Modal from '@/components/Modal/Modal';
import { Activity } from '../types';

type ConfirmationModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toContinue: Activity[];
  toDiscontinue: Activity[];
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  toContinue,
  toDiscontinue,
}) => {
  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Confirm Changes">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Confirm Changes</h2>
        <p className="mb-4">Are you sure you want to save these changes?</p>
        {toContinue.length > 0 && (
          <div className="mb-4">
            <p>
              <strong>{toContinue.length} activities will be continued:</strong>
            </p>
            <ul className="list-disc pl-5">
              {toContinue.map((activity) => (
                <li key={activity.id}>{activity.name}</li>
              ))}
            </ul>
          </div>
        )}
        {toDiscontinue.length > 0 && (
          <div className="mb-4">
            <p>
              <strong>
                {toDiscontinue.length} activities will be discontinued:
              </strong>
            </p>
            <ul className="list-disc pl-5">
              {toDiscontinue.map((activity) => (
                <li key={activity.id}>{activity.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};
