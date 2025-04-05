// src/features/Sessions/ui/GroupSessionCard.tsx
'use client';

import React, { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';
import { useSessionStore } from '@/stores/sessionStore';
import GroupSessionModal from './GroupSessionModal';
import DeclineSessionModal from './DeclineSessionModal';
import { apiClient } from '@/lib/api-client';
import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';
import { useDeclineSession } from '../hooks/useDeclineSession';

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
  const { decliningSession, setDecliningSession, clearDecliningSession } = useSessionStore();

  const { data: activeAdmissions = [], isLoading: isAdmissionsLoading } = useActiveAdmissions();
  const { data: activeActivities = [], isLoading: isActivitiesLoading } = useActiveActivities();
  const { declineReasons, declineSession, isLoadingReasons } = useDeclineSession();

  const endGroupSessionMutation = useMutation({
    mutationFn: async () => {
      logger.info('Initiating end group session', { groupRef });
      return apiClient.post(`/api/sessions/group/${groupRef}/end`);
    },
    onSuccess: () => {
      logger.info('Group session ended successfully', { groupRef });
      toast.success('Group session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      logger.error('Failed to end group session', { groupRef, error: err.response?.data?.error || err.message });
      toast.error(err.response?.data?.error || 'Failed to end group session');
    },
  });

  const endUserSessionMutation = useMutation({
    mutationFn: async (admissionId: number) => {
      logger.info('Initiating end user session in group', { groupRef, admissionId });
      return apiClient.post(`/api/sessions/group/${groupRef}/end-user`, { admissionId });
    },
    onSuccess: () => {
      logger.info('User session ended successfully', { groupRef });
      toast.success('User session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      logger.error('Failed to end user session', { groupRef, error: err.response?.data?.error || err.message });
      toast.error(err.response?.data?.error || 'Failed to end user session');
    },
  });

  const handleDeclineClick = useCallback((sessionId: number) => {
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
  }, [sessions, setDecliningSession]);

  const handleDeclineSubmit = useCallback(
    (sessionId: number, declineReasonId: number, description: string | null) => {
      logger.info('Submitting group session decline', { sessionId, declineReasonId, description });
      declineSession({ sessionId, declineReasonId, description, isGroup: true });
      clearDecliningSession();
    },
    [declineSession, clearDecliningSession],
  );

  const decliningSessionData = decliningSession && sessions.find((s) => s.id === decliningSession.id);

  if (isAdmissionsLoading || isActivitiesLoading || isLoadingReasons) {
    logger.debug('Loading state detected', { isAdmissionsLoading, isActivitiesLoading, isLoadingReasons });
    return <div>Loading admissions, activities, and reasons...</div>;
  }

  logger.debug('Rendering GroupSessionCard', { groupRef, sessionCount: sessions.length });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg"
    >
      <div className="card-body">
        <h2 className="card-title text-xl text-gray-900 dark:text-gray-100">{groupDescription || `Group ${groupRef}`}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Activity:</strong> {sessions[0]?.activityLog?.activity?.name ?? 'N/A'}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {sessions.map((s) =>
            s.admission?.serviceUser ? (
              <div
                key={s.id}
                className="badge badge-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-full px-3 py-1 flex items-center"
              >
                <span>{s.admission.serviceUser.name} <span className="ml-1 text-xs">(Ward: {s.admission?.ward?.name})</span></span>
                <button
                  onClick={() => handleDeclineClick(s.id)}
                  className="ml-2 text-yellow-500 hover:text-yellow-700"
                  title="Decline Session"
                >
                  ✗
                </button>
                <button
                  onClick={() => endUserSessionMutation.mutate(s.admission.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="End Session for User"
                >
                  ⏹
                </button>
              </div>
            ) : null,
          )}
        </div>
        <div className="card-actions justify-end mt-4">
          <button onClick={() => setShowAddUsersModal(true)} className="btn bg-teal-500 hover:bg-teal-600 text-white rounded-lg mr-2">Add More Users</button>
          <button onClick={() => endGroupSessionMutation.mutate()} className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg">End Group Session</button>
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
      />
      {decliningSessionData && (
        <DeclineSessionModal
          show={!!decliningSession}
          sessionId={decliningSession.id}
          serviceUserName={decliningSession.serviceUserName}
          activityName={decliningSession.activityName}
          declineReasons={declineReasons}
          onDecline={handleDeclineSubmit}
          onClose={() => {
            logger.info('Closing DeclineSessionModal', { sessionId: decliningSession.id });
            clearDecliningSession();
          }}
        />
      )}
    </motion.div>
  );
};

export default GroupSessionCard;
// src/features/Sessions/ui/GroupSessionCard.tsx
