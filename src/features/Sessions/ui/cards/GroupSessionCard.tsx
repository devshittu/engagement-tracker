// src/features/Sessions/ui/GroupSessionCard.tsx

'use client';

import React, { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { logger } from '@/lib/logger';
import GroupSessionModal from '../modals/GroupSessionModal';
import DeclineSessionModal from '../modals/DeclineSessionModal';
import ConfirmationDialog from '@/components/ui/modals/ConfirmationDialog';
import { apiClient } from '@/lib/api-client';
import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';
import { useDeclineSession } from '@/features/Sessions/hooks/useDeclineSession';
import {
  HiUsers,
  HiPlus,
  HiXCircle,
  HiXMark,
  HiStopCircle,
} from 'react-icons/hi2';

type GroupSessionCardProps = {
  groupRef: string;
  groupDescription: string;
  sessions: any[];
};

const GroupSessionCard: React.FC<GroupSessionCardProps> = ({
  groupRef,
  groupDescription,
  sessions,
}) => {
  const queryClient = useQueryClient();
  const [showAddUsersModal, setShowAddUsersModal] = React.useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [isEndUserModalOpen, setIsEndUserModalOpen] = React.useState(false);
  const [isEndGroupModalOpen, setIsEndGroupModalOpen] = React.useState(false);
  const [decliningSession, setDecliningSession] = React.useState<{
    id: number;
    serviceUserName: string;
    activityName: string;
  } | null>(null);
  const [endingUserSession, setEndingUserSession] = React.useState<{
    admissionId: number;
    serviceUserName: string;
  } | null>(null);

  const { data: activeAdmissions = [], isLoading: isAdmissionsLoading } =
    useActiveAdmissions();
  const { data: activeActivities = [], isLoading: isActivitiesLoading } =
    useActiveActivities();
  const { declineReasons, declineSession, isLoadingReasons } =
    useDeclineSession();

  useEffect(() => {
    logger.debug('State updated in GroupSessionCard', {
      decliningSession,
      isDeclineModalOpen,
      endingUserSession,
      isEndUserModalOpen,
      isEndGroupModalOpen,
    });
  }, [
    decliningSession,
    isDeclineModalOpen,
    endingUserSession,
    isEndUserModalOpen,
    isEndGroupModalOpen,
  ]);

  const endGroupSessionMutation = useMutation({
    mutationFn: async () => {
      logger.info('Initiating end group session', { groupRef });
      return apiClient.post(`/api/sessions/group/${groupRef}/end`);
    },
    onSuccess: () => {
      logger.info('Group session ended successfully', { groupRef });
      toast.success('Group session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setIsEndGroupModalOpen(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end group session', {
        groupRef,
        error: err.response?.data?.error || err.message,
      });
      toast.error(err.response?.data?.error || 'Failed to end group session');
    },
  });

  const endUserSessionMutation = useMutation({
    mutationFn: async (admissionId: number) => {
      logger.info('Initiating end user session in group', {
        groupRef,
        admissionId,
      });
      return apiClient.post(`/api/sessions/group/${groupRef}/end-user`, {
        admissionId,
      });
    },
    onSuccess: () => {
      logger.info('User session ended successfully', { groupRef });
      toast.success('User session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      setEndingUserSession(null);
      setIsEndUserModalOpen(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end user session', {
        groupRef,
        error: err.response?.data?.error || err.message,
      });
      toast.error(err.response?.data?.error || 'Failed to end user session');
    },
  });

  const handleDeclineClick = useCallback(
    (sessionId: number) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        logger.warn('Session not found for decline', { sessionId });
        return;
      }
      const decliningData = {
        id: session.id,
        serviceUserName: session.admission?.serviceUser?.name || 'Unknown',
        activityName: session.activityLog?.activity?.name || 'N/A',
      };
      logger.info('Decline clicked for group session', decliningData);
      setDecliningSession(decliningData);
      setIsDeclineModalOpen(true);
      logger.debug('Opening decline modal', { decliningData });
    },
    [sessions],
  );

  const handleEndUserClick = useCallback(
    (admissionId: number, serviceUserName: string) =>
      (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        logger.info('End user session clicked', {
          groupRef,
          admissionId,
          serviceUserName,
        });
        setEndingUserSession({ admissionId, serviceUserName });
        setIsEndUserModalOpen(true);
      },
    [groupRef],
  );

  const handleEndGroupClick = useCallback(() => {
    logger.info('End group session clicked', { groupRef });
    setIsEndGroupModalOpen(true);
  }, [groupRef]);

  const handleDeclineSubmit = useCallback(
    (
      sessionId: number,
      declineReasonId: number,
      description: string | null,
    ) => {
      logger.info('Submitting group session decline', {
        sessionId,
        declineReasonId,
        description,
      });
      declineSession({ sessionId, declineReasonId, description });
      setDecliningSession(null);
      setIsDeclineModalOpen(false);
    },
    [declineSession],
  );

  const handleCloseDeclineModal = useCallback(() => {
    logger.info('Closing DeclineSessionModal', {
      sessionId: decliningSession?.id,
    });
    setDecliningSession(null);
    setIsDeclineModalOpen(false);
  }, [decliningSession]);

  if (isAdmissionsLoading || isActivitiesLoading || isLoadingReasons) {
    logger.debug('Loading state detected', {
      isAdmissionsLoading,
      isActivitiesLoading,
      isLoadingReasons,
    });
    return <div>Loading admissions, activities, and reasons...</div>;
  }

  logger.debug('Rendering GroupSessionCard', {
    groupRef,
    sessionCount: sessions.length,
  });

  // Format session start time
  const sessionStartTime = sessions[0]?.createdAt
    ? new Date(sessions[0].createdAt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  // Get activity name or fallback to groupDescription
  const sessionName =
    sessions[0]?.activityLog?.activity?.name ||
    groupDescription ||
    `Group ${groupRef}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        {/* Title and Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {groupDescription || `Group ${groupRef}`}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
            <span className="font-medium">Activity:</span>{' '}
            {sessions[0]?.activityLog?.activity?.name ?? 'N/A'}
          </p>
        </div>

        {/* Participant Count and List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HiUsers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {sessions.length} Participant{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) =>
              s.admission?.serviceUser ? (
                <div
                  key={s.id}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-sm border-none"
                >
                  <span>
                    {s.admission.serviceUser.name}
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      (Ward: {s.admission?.ward?.name})
                    </span>
                  </span>
                  <button
                    onClick={handleDeclineClick(s.id)}
                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                    title="Decline this user’s session"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleEndUserClick(
                      s.admission.id,
                      s.admission.serviceUser.name,
                    )}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="End session for this user"
                  >
                    <HiStopCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAddUsersModal(true)}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200"
            title="Add more users to this group session"
          >
            <HiPlus className="w-5 h-5" />
            Add Users
          </button>
          <button
            onClick={handleEndGroupClick}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200"
            title="End this group session"
          >
            <HiXCircle className="w-5 h-5" />
            End Session
          </button>
        </div>
      </div>

      <GroupSessionModal
        isOpen={showAddUsersModal}
        onClose={() => {
          logger.info('Closing GroupSessionModal', { groupRef });
          setShowAddUsersModal(false);
        }}
        onSessionCreated={() => {
          logger.info('Session created via GroupSessionModal', { groupRef });
          setShowAddUsersModal(false);
          queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        }}
        existingSessionId={sessions[0]?.id}
        groupRef={groupRef}
        activityLogId={sessions[0]?.activityLogId}
        context="group-card"
      />

      {decliningSession && (
        <Transition appear show={isDeclineModalOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={handleCloseDeclineModal}
          >
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel>
                    <DeclineSessionModal
                      show={isDeclineModalOpen}
                      sessionId={decliningSession.id}
                      serviceUserName={decliningSession.serviceUserName}
                      activityName={decliningSession.activityName}
                      declineReasons={declineReasons}
                      onDecline={handleDeclineSubmit}
                      onClose={handleCloseDeclineModal}
                    />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {endingUserSession && (
        <ConfirmationDialog
          isOpen={isEndUserModalOpen}
          onClose={() => setIsEndUserModalOpen(false)}
          onConfirm={() =>
            endUserSessionMutation.mutate(endingUserSession.admissionId)
          }
          title="End User Session"
          message={`Are you sure you want to end the session for ${endingUserSession.serviceUserName} in group ${sessionName}? This action cannot be undone.`}
          isPending={endUserSessionMutation.isPending}
          icon={
            <svg
              className="w-12 h-12 text-red-500"
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
          }
        />
      )}

      <ConfirmationDialog
        isOpen={isEndGroupModalOpen}
        onClose={() => setIsEndGroupModalOpen(false)}
        onConfirm={() => endGroupSessionMutation.mutate()}
        title="End Group Session"
        message={`Are you sure you want to end the "${sessionName}" session with ${sessions.length} participants? Started at ${sessionStartTime}. This action cannot be undone.`}
        isPending={endGroupSessionMutation.isPending}
        icon={
          <svg
            className="w-12 h-12 text-red-500"
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
        }
      />
    </motion.div>
  );
};

export default GroupSessionCard;
// src/features/Sessions/ui/GroupSessionCard.tsx
