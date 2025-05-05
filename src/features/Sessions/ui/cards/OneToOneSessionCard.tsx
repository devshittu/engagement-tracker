// src/features/Sessions/ui/dashboard/components/OneToOneSessionCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Session } from '@/types/serviceUser';
import ElapsedTime from '@/features/Sessions/ui/ElapsedTime';

type OneToOneSessionCardProps = {
  session: Session;
  onDecline: (event: React.MouseEvent) => void;
  onEndSession: (event: React.MouseEvent) => void;
};

const OneToOneSessionCard: React.FC<OneToOneSessionCardProps> = ({
  session,
  onDecline,
  onEndSession,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="card-body">
      <h2 className="card-title text-xl text-gray-900 dark:text-gray-100">
        {session.admission.serviceUser.name}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <strong>Activity:</strong> {session.activityLog.activity.name}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <strong>Ward:</strong> {session.admission.ward.name}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <strong>Time In:</strong> {new Date(session.timeIn).toLocaleString()}
      </p>
      <div className="my-4">
        <ElapsedTime timeIn={session.timeIn} timeOut={session.timeOut} big />
      </div>
      {!session.timeOut && (
        <div className="card-actions justify-between space-x-2">
          <button
            onClick={onDecline}
            className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Decline
          </button>
          <button
            onClick={onEndSession}
            className="btn bg-red-500 hover:bg-red-600 text-white"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  </motion.div>
);

export default OneToOneSessionCard;
// src/features/Sessions/ui/dashboard/components/OneToOneSessionCard.tsx
