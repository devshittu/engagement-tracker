// src/features/Sessions/ui/ActiveSessionsDashboard.tsx
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useActiveSessions,
  useActiveSessionsCounts,
} from '../hooks/useActiveSessions';
import { useDeclineSession } from '../hooks/useDeclineSession';
import ElapsedTime from './ElapsedTime';
import GroupSessionCard from './GroupSessionCard';
import DeclineSessionModal from './DeclineSessionModal';
import Modal from '@/components/Modal/Modal';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

const ActiveSessionsDashboard: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showEndAllOneToOneModal, setShowEndAllOneToOneModal] = useState(false);
  const [showEndAllGroupModal, setShowEndAllGroupModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [decliningSession, setDecliningSession] = useState<{
    id: number;
    serviceUserName: string;
    activityName: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { declineReasons, declineSession, isLoadingReasons } = useDeclineSession();

  const {
    oneToOneCount,
    groupCount,
    isLoading: isCountsLoading,
    error: countsError,
  } = useActiveSessionsCounts();
  const {
    data: oneToOneData,
    isLoading: isOneToOneLoading,
    error: oneToOneError,
  } = useActiveSessions({
    sortBy: 'timeIn',
    order: sortOrder,
    type: 'ONE_TO_ONE',
  });
  const {
    data: groupData,
    isLoading: isGroupLoading,
    error: groupError,
  } = useActiveSessions({
    sortBy: 'timeIn',
    order: sortOrder,
    type: 'GROUP',
    groupByGroupRef: true,
  });

  const totalActive = (oneToOneData?.total ?? 0) + (groupData?.total ?? 0);
  const oneToOneSessions = useMemo(
    () => ('sessions' in (oneToOneData ?? {}) ? oneToOneData.sessions : []),
    [oneToOneData],
  );
  const groupSessions = useMemo(
    () => ('groups' in (groupData ?? {}) ? groupData.groups : []),
    [groupData],
  );
  const sessionsToDisplay = useMemo(
    () => oneToOneSessions.slice(0, 6 - groupSessions.length),
    [oneToOneSessions, groupSessions],
  );

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiClient.post(`/api/sessions/${sessionId}/end`, { id: sessionId });
      return response;
    },
    onSuccess: () => {
      toast.success('Session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to end session');
    },
  });

  const endAllOneToOneMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/sessions/end-all/one-to-one');
      return response;
    },
    onSuccess: () => {
      toast.success('All one-to-one sessions ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setShowEndAllOneToOneModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to end all one-to-one sessions');
    },
  });

  const endAllGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/sessions/end-all/group');
      return response;
    },
    onSuccess: () => {
      toast.success('All group sessions ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setShowEndAllGroupModal(false);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to end all group sessions');
    },
  });

  const handleDeclineClick = useCallback((session: any) => {
    setDecliningSession({
      id: session.id,
      serviceUserName: session.admission.serviceUser.name,
      activityName: session.activityLog.activity.name,
    });
    setShowDeclineModal(true);
  }, []);

  const handleDeclineSubmit = useCallback(
    (sessionId: number, declineReasonId: number, description: string | null) => {
      declineSession({ sessionId, declineReasonId, description });
    },
    [declineSession],
  );

  const renderOneToOneSession = useCallback(
    (session: any) => (
      <motion.div
        key={session.id}
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
            <strong>Time In:</strong>{' '}
            {new Date(session.timeIn).toLocaleString()}
          </p>
          <div className="my-4">
            <ElapsedTime
              timeIn={session.timeIn}
              timeOut={session.timeOut}
              big
            />
          </div>
          <div className="card-actions justify-between space-x-2">
            {!session.timeOut && (
              <>
                <button
                  onClick={() => handleDeclineClick(session)}
                  className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Decline
                </button>
                <button
                  onClick={() => endSessionMutation.mutate(session.id)}
                  className="btn bg-red-500 hover:bg-red-600 text-white"
                >
                  End Session
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    ),
    [endSessionMutation, handleDeclineClick],
  );

  if (isOneToOneLoading || isGroupLoading || isCountsLoading || isLoadingReasons) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <span className="loading loading-spinner loading-lg"></span> Loading
        active sessions...
      </div>
    );
  }

  if (countsError || oneToOneError || groupError) {
    return (
      <p className="text-center text-red-500">
        Error loading sessions:{' '}
        {(countsError || oneToOneError || groupError)?.message}
      </p>
    );
  }

  if (totalActive === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center min-h-[40vh]"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          No Active Sessions
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mb-4">
          To start a session, use the search box below to find a service user
          you want to engage.
        </p>
        <p className="text-base text-gray-500 dark:text-gray-400">
          <em>Then come back here once a session is started!</em>
        </p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Active Sessions
        </h1>
        <div className="flex flex-wrap items-center space-x-4 mt-4 md:mt-0">
          <div className="badge badge-lg bg-teal-500 text-white">
            Total Active: {totalActive}
          </div>
          <button
            className="btn btn-outline hover:bg-teal-500 hover:text-white"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
          </button>
          <button
            onClick={() => setShowEndAllOneToOneModal(true)}
            className={`btn bg-red-500 hover:bg-red-600 text-white ${oneToOneCount === 0 ? 'btn-disabled' : ''}`}
            disabled={oneToOneCount === 0}
          >
            End All One-to-One ({oneToOneCount})
          </button>
          <button
            onClick={() => setShowEndAllGroupModal(true)}
            className={`btn bg-red-600 hover:bg-red-700 text-white ${groupCount === 0 ? 'btn-disabled' : ''}`}
            disabled={groupCount === 0}
          >
            End All Group ({groupCount})
          </button>
          <Link
            href="/sessions/declined"
            className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            View Declined
          </Link>
          {totalActive > 6 && (
            <Link
              href="/sessions/active"
              className="btn bg-teal-500 hover:bg-teal-600 text-white"
            >
              View All
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {groupSessions.map((group: any) => (
          <GroupSessionCard
            key={group.groupRef}
            groupRef={group.groupRef}
            groupDescription={group.groupDescription}
            sessions={group.sessions}
            admissions={[]} // Placeholder; requires backend update
            activities={[]} // Placeholder; requires backend update
          />
        ))}
        {sessionsToDisplay.map(renderOneToOneSession)}
      </div>

      <Modal
        show={showEndAllOneToOneModal}
        handleClose={() => setShowEndAllOneToOneModal(false)}
        ariaLabel="Confirm End All One-to-One Sessions"
      >
        <div className="p-4 text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-red-500"
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
            End All One-to-One Sessions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to end all {oneToOneCount} active one-to-one
            sessions? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEndAllOneToOneModal(false)}
              className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => endAllOneToOneMutation.mutate()}
              className={`btn bg-red-500 hover:bg-red-600 text-white ${endAllOneToOneMutation.isPending ? 'btn-disabled' : ''}`}
              disabled={endAllOneToOneMutation.isPending}
            >
              {endAllOneToOneMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        show={showEndAllGroupModal}
        handleClose={() => setShowEndAllGroupModal(false)}
        ariaLabel="Confirm End All Group Sessions"
      >
        <div className="p-4 text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-red-500"
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
            End All Group Sessions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to end all {groupCount} active group sessions?
            This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEndAllGroupModal(false)}
              className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => endAllGroupMutation.mutate()}
              className={`btn bg-red-500 hover:bg-red-600 text-white ${endAllGroupMutation.isPending ? 'btn-disabled' : ''}`}
              disabled={endAllGroupMutation.isPending}
            >
              {endAllGroupMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {decliningSession && (
        <DeclineSessionModal
          show={showDeclineModal}
          sessionId={decliningSession.id}
          serviceUserName={decliningSession.serviceUserName}
          activityName={decliningSession.activityName}
          declineReasons={declineReasons}
          onDecline={handleDeclineSubmit}
          onClose={() => setShowDeclineModal(false)}
        />
      )}
    </div>
  );
};

export default ActiveSessionsDashboard;
// src/features/Sessions/ui/ActiveSessionsDashboard.tsx
