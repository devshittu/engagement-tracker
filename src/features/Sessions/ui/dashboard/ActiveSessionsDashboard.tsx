// src/features/Sessions/ui/ActiveSessionsDashboard.tsx

'use client';

import React, { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import {
  useActiveSessions,
  useActiveSessionsCounts,
} from '@/features/Sessions/hooks/useActiveSessions';
import { useDeclineSession } from '@/features/Sessions/hooks/useDeclineSession';
import DashboardHeader from './components/DashboardHeader';
import SessionGrid from './components/SessionGrid';
import ConfirmationDialog from '@/components/ui/modals/ConfirmationDialog';
import DeclineSessionModal from '@/features/Sessions/ui/modals/DeclineSessionModal';
import { Dialog, Transition } from '@headlessui/react';
import { apiClient } from '@/lib/api-client';
// import { EditSessionTimesModal } from './EditSessionTimesModal';
import { Session } from '@prisma/client';
import { EditSessionTimesModal } from '../EditSessionTimesModal';

const ActiveSessionsDashboard: React.FC = () => {
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [showEndAllOneToOneModal, setShowEndAllOneToOneModal] =
    React.useState(false);
  const [showEndAllGroupModal, setShowEndAllGroupModal] = React.useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] =
    React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [decliningSession, setDecliningSession] = React.useState<{
    id: number;
    serviceUserName: string;
    activityName: string;
  } | null>(null);
  const [endingSession, setEndingSession] = React.useState<{
    id: number;
    serviceUserName: string;
  } | null>(null);
  const [editingSession, setEditingSession] = React.useState<Session | null>(
    null,
  );

  const queryClient = useQueryClient();
  const router = useRouter();
  const { declineReasons, declineSession, isLoadingReasons } =
    useDeclineSession();

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

  useEffect(() => {
    logger.debug('State updated in ActiveSessionsDashboard', {
      decliningSession,
      isDeclineModalOpen,
      endingSession,
      isEndSessionModalOpen,
      showEndAllOneToOneModal,
      showEndAllGroupModal,
      isEditModalOpen,
      editingSession,
    });
  }, [
    decliningSession,
    isDeclineModalOpen,
    endingSession,
    isEndSessionModalOpen,
    showEndAllOneToOneModal,
    showEndAllGroupModal,
    isEditModalOpen,
    editingSession,
  ]);

  const totalActive = (oneToOneData?.total ?? 0) + (groupData?.total ?? 0);

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      logger.info('Ending session', { sessionId });
      const response = await apiClient.post(`/api/sessions/${sessionId}/end`, {
        id: sessionId,
      });
      return response;
    },
    onSuccess: () => {
      logger.info('Session ended successfully', {
        sessionId: endSessionMutation.variables,
      });
      toast.success('Session ended successfully!');
      queryClient.invalidateQueries({
        queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }],
      });
      setEndingSession(null);
      setIsEndSessionModalOpen(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end session', {
        sessionId: endSessionMutation.variables,
        error: err.message,
      });
      toast.error(err.message || 'Failed to end session');
    },
  });

  const endAllOneToOneMutation = useMutation({
    mutationFn: async () => {
      logger.info('Ending all one-to-one sessions', { count: oneToOneCount });
      const response = await apiClient.post('/api/sessions/end-all/one-to-one');
      return response;
    },
    onSuccess: () => {
      logger.info('All one-to-one sessions ended successfully', {
        count: oneToOneCount,
      });
      toast.success('All one-to-one sessions ended successfully!');
      queryClient.invalidateQueries({
        queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }],
      });
      setShowEndAllOneToOneModal(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end all one-to-one sessions', {
        error: err.message,
      });
      toast.error(err.message || 'Failed to end all one-to-one sessions');
    },
  });

  const endAllGroupMutation = useMutation({
    mutationFn: async () => {
      logger.info('Ending all group sessions', { count: groupCount });
      const response = await apiClient.post('/api/sessions/end-all/group');
      return response;
    },
    onSuccess: () => {
      logger.info('All group sessions ended successfully', {
        count: groupCount,
      });
      toast.success('All group sessions ended successfully!');
      queryClient.invalidateQueries({
        queryKey: ['activeSessions', { type: 'GROUP' }],
      });
      setShowEndAllGroupModal(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end all group sessions', { error: err.message });
      toast.error(err.message || 'Failed to end all group sessions');
    },
  });

  const handleDeclineClick = useCallback(
    (session: any) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const decliningData = {
        id: session.id,
        serviceUserName: session.admission.serviceUser.name,
        activityName: session.activityLog.activity.name,
      };
      logger.info('Decline button clicked', decliningData);
      setDecliningSession(decliningData);
      setIsDeclineModalOpen(true);
    },
    [],
  );

  const handleEndSessionClick = useCallback(
    (sessionId: number, serviceUserName: string) =>
      (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        logger.info('End session clicked', { sessionId, serviceUserName });
        setEndingSession({ id: sessionId, serviceUserName });
        setIsEndSessionModalOpen(true);
      },
    [],
  );

  const handleEditSessionClick = useCallback(
    (session: Session) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      logger.info('Edit session times clicked', { sessionId: session.id });
      setEditingSession(session);
      setIsEditModalOpen(true);
    },
    [],
  );

  const handleDeclineSubmit = useCallback(
    (
      sessionId: number,
      declineReasonId: number,
      description: string | null,
    ) => {
      logger.info('Submitting decline', {
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
    logger.info('Closing decline modal', { sessionId: decliningSession?.id });
    setDecliningSession(null);
    setIsDeclineModalOpen(false);
  }, [decliningSession]);

  const toggleSortOrder = useCallback(() => {
    logger.info('Toggling sort order', {
      previous: sortOrder,
      new: sortOrder === 'asc' ? 'desc' : 'asc',
    });
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, [sortOrder]);

  if (
    isOneToOneLoading ||
    isGroupLoading ||
    isCountsLoading ||
    isLoadingReasons
  ) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <span className="loading loading-spinner loading-lg"></span> Loading
        active sessions...
      </div>
    );
  }

  if (countsError || oneToOneError || groupError) {
    logger.error('Error loading sessions', {
      countsError: countsError?.message,
      oneToOneError: oneToOneError?.message,
      groupError: groupError?.message,
    });
    return (
      <p className="text-center text-red-500">
        Error loading sessions:{' '}
        {(countsError || oneToOneError || groupError)?.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardHeader
        totalActive={totalActive}
        oneToOneCount={oneToOneCount}
        groupCount={groupCount}
        sortOrder={sortOrder}
        onToggleSort={toggleSortOrder}
        onEndAllOneToOne={() => setShowEndAllOneToOneModal(true)}
        onEndAllGroup={() => setShowEndAllGroupModal(true)}
      />
      <SessionGrid
        oneToOneData={oneToOneData}
        groupData={groupData}
        onDecline={handleDeclineClick}
        onEndSession={handleEndSessionClick}
        onEditSession={handleEditSessionClick}
      />
      <ConfirmationDialog
        isOpen={showEndAllOneToOneModal}
        onClose={() => setShowEndAllOneToOneModal(false)}
        onConfirm={() => endAllOneToOneMutation.mutate()}
        title="End All One-to-One Sessions"
        message={`Are you sure you want to end all ${oneToOneCount} active one-to-one sessions? This action cannot be undone.`}
        isPending={endAllOneToOneMutation.isPending}
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
      <ConfirmationDialog
        isOpen={showEndAllGroupModal}
        onClose={() => setShowEndAllGroupModal(false)}
        onConfirm={() => endAllGroupMutation.mutate()}
        title="End All Group Sessions"
        message={`Are you sure you want to end all ${groupCount} active group sessions? This action cannot be undone.`}
        isPending={endAllGroupMutation.isPending}
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
      {endingSession && (
        <ConfirmationDialog
          isOpen={isEndSessionModalOpen}
          onClose={() => setIsEndSessionModalOpen(false)}
          onConfirm={() => endSessionMutation.mutate(endingSession.id)}
          title="End Session"
          message={`Are you sure you want to end the session for ${endingSession.serviceUserName}? This action cannot be undone.`}
          isPending={endSessionMutation.isPending}
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
      {editingSession && (
        <EditSessionTimesModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          session={editingSession}
        />
      )}
    </div>
  );
};

export default ActiveSessionsDashboard;
// src/features/Sessions/ui/ActiveSessionsDashboard.tsx
