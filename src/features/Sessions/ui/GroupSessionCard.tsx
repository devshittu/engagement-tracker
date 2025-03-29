// src/features/Sessions/ui/GroupSessionCard.tsx
'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GroupSessionModal from './GroupSessionModal';
import { apiClient } from '@/lib/api-client';
import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';

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
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);

  const { data: activeAdmissions = [], isLoading: isAdmissionsLoading } = useActiveAdmissions();
  const { data: activeActivities = [], isLoading: isActivitiesLoading } = useActiveActivities();

  const endGroupSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/api/sessions/group/${groupRef}/end`);
      return response;
    },
    onSuccess: () => {
      toast.success('Group session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to end group session');
    },
  });

  const declineSessionMutation = useMutation({
    mutationFn: async (admissionId: number) => {
      const response = await apiClient.post(`/api/sessions/group/${groupRef}/remove`, {
        admissionId,
      });
      return response;
    },
    onSuccess: () => {
      toast.success('User declined session successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to decline session');
    },
  });

  const endUserSessionMutation = useMutation({
    mutationFn: async (admissionId: number) => {
      const response = await apiClient.post(`/api/sessions/group/${groupRef}/end-user`, {
        admissionId,
      });
      return response;
    },
    onSuccess: () => {
      toast.success('User session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to end user session');
    },
  });

  const session = sessions[0]; // Use the first session for group metadata

  if (isAdmissionsLoading || isActivitiesLoading) {
    return <div>Loading admissions and activities...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg"
    >
      <div className="card-body">
        <h2 className="card-title text-xl text-gray-900 dark:text-gray-100">
          {groupDescription || `Group ${groupRef}`}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Activity:</strong>{' '}
          {session?.activityLog?.activity?.name ?? 'N/A'}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {sessions.map((s) =>
            s.admission?.serviceUser ? (
              <div
                key={s.id}
                className="badge badge-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-full px-3 py-1 flex items-center"
              >
                <span>
                  {s.admission.serviceUser.name}
                  <span className="ml-1 text-xs">
                    (Ward: {s.admission?.ward?.name})
                  </span>
                </span>
                <button
                  onClick={() => declineSessionMutation.mutate(s.admission.id)}
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
          <button
            onClick={() => setShowAddUsersModal(true)}
            className="btn bg-teal-500 hover:bg-teal-600 text-white rounded-lg mr-2"
          >
            Add More Users
          </button>
          <button
            onClick={() => endGroupSessionMutation.mutate()}
            className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            End Group Session
          </button>
        </div>
      </div>
      <GroupSessionModal
        isOpen={showAddUsersModal}
        onClose={() => setShowAddUsersModal(false)}
        admissions={activeAdmissions}
        activities={activeActivities}
        onSessionCreated={() => {
          setShowAddUsersModal(false);
          queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        }}
        existingSessionId={session.id}
      />
    </motion.div>
  );
};

export default GroupSessionCard;
// src/features/Sessions/ui/GroupSessionCard.tsx
