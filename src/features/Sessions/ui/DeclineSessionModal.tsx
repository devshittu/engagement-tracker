// src/features/Sessions/ui/DeclineSessionModal.tsx

'use client';

import React, { useEffect } from 'react';
import Modal from '@/components/Modal/Modal';
import { DeclineReason } from '../types';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

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
  const [selectedReasonId, setSelectedReasonId] = React.useState<number | null>(null);
  const [description, setDescription] = React.useState<string>('');

  useEffect(() => {
    logger.debug('DeclineSessionModal rendered', { sessionId, show, hasReasons: declineReasons.length });
  }, [sessionId, show, declineReasons]);

  const handleSubmit = () => {
    if (!selectedReasonId) {
      logger.warn('Decline submit attempted without reason', { sessionId });
      return;
    }
    logger.info('Decline modal submitted', { sessionId, selectedReasonId, description });
    onDecline(sessionId, selectedReasonId, description.trim() || null);
    setSelectedReasonId(null);
    setDescription('');
  };

  return (
    <Modal show={show} handleClose={onClose} ariaLabel="Decline Session Confirmation">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-yellow-500 dark:bg-yellow-600 p-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Decline Session</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
            Why is <strong className="text-gray-900 dark:text-gray-100">{serviceUserName}</strong> declining the session{' '}
            <strong className="text-gray-900 dark:text-gray-100">{activityName}</strong>?
          </p>
          <div className="form-control mb-4">
            <label htmlFor="declineReason" className="label">
              <span className="label-text font-medium text-gray-700 dark:text-gray-300">Reason</span>
            </label>
            <select
              id="declineReason"
              value={selectedReasonId || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                logger.debug('Decline reason selected', { sessionId, reasonId: value });
                setSelectedReasonId(value);
              }}
              className="select select-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Select a reason</option>
              {declineReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>{reason.name}</option>
              ))}
            </select>
          </div>
          <div className="form-control mb-4">
            <label htmlFor="description" className="label">
              <span className="label-text font-medium text-gray-700 dark:text-gray-300">Description (optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                logger.debug('Decline description updated', { sessionId, description: e.target.value });
                setDescription(e.target.value);
              }}
              rows={3}
              className="textarea textarea-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Add any additional details..."
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-4">
          <button onClick={onClose} className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReasonId}
            className={`btn bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg ${!selectedReasonId ? 'btn-disabled' : ''}`}
          >
            Decline
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DeclineSessionModal;
// src/features/Sessions/ui/DeclineSessionModal.tsx