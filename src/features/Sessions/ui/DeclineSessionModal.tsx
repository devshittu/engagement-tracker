// src/features/Sessions/ui/DeclineSessionModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import { DeclineReason } from '../types';

type DeclineSessionModalProps = {
  show: boolean;
  sessionId: number;
  serviceUserName: string;
  activityName: string;
  declineReasons: DeclineReason[];
  onDecline: (sessionId: number, declineReasonId: number, description: string | null) => void;
  onClose: () => void;
};

const DeclineSessionModal: React.FC<DeclineSessionModalProps> = ({
  show,
  sessionId,
  serviceUserName,
  activityName,
  declineReasons,
  onDecline,
  onClose,
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedReasonId) return;
    onDecline(sessionId, selectedReasonId, description.trim() || null);
    setSelectedReasonId(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Decline Session Confirmation">
      <div className="p-6 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 mx-auto text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Decline Session
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Why is <strong>{serviceUserName}</strong> declining the session{' '}
          <strong>{activityName}</strong>?
        </p>
        <div className="mb-4">
          <label htmlFor="declineReason" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason
          </label>
          <select
            id="declineReason"
            value={selectedReasonId || ''}
            onChange={(e) => setSelectedReasonId(parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="">Select a reason</option>
            {declineReasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder="Add any additional details..."
          />
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReasonId}
            className={`btn bg-yellow-500 hover:bg-yellow-600 text-white ${!selectedReasonId ? 'btn-disabled' : ''}`}
          >
            Decline
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeclineSessionModal;