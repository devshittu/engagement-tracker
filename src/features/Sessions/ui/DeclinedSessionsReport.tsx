// src/features/Sessions/ui/DeclinedSessionsReport.tsx
'use client';

import React from 'react';
import { useDeclinedSessions } from '../hooks/useDeclinedSessions';

const DeclinedSessionsReport: React.FC = () => {
  const { data: declinedSessions, isLoading, error } = useDeclinedSessions();

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <span className="loading loading-spinner loading-lg"></span> Loading declined sessions...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error loading declined sessions: {error.message}
      </p>
    );
  }

  if (!declinedSessions || declinedSessions.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        No declined sessions recorded yet.
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Declined Sessions Report
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {declinedSessions.map((session) => (
          <div
            key={session.id}
            className="card bg-white dark:bg-gray-800 shadow-lg p-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {session.session.admission.serviceUser.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Activity:</strong> {session.session.activityLog.activity.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Reason:</strong> {session.declineReason.name}
            </p>
            {session.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Description:</strong> {session.description}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Declined At:</strong>{' '}
              {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeclinedSessionsReport;