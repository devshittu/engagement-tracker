// src/features/Sessions/ui/GroupSessionModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal/Modal';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';
import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
import { logger } from '@/lib/logger';

type ServiceUserOption = {
  id: number;
  name: string;
  nhsNumber: string;
  ward: string;
};

type GroupSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: () => void;
  existingSessionId?: number;
};

const GroupSessionModal: React.FC<GroupSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  existingSessionId,
}) => {
  const { data: activities = [], isLoading: isActivitiesLoading } =
    useActiveActivities();
  const { data: admissions = [], isLoading: isAdmissionsLoading } =
    useActiveAdmissions();

  const [selectedActivityLogId, setSelectedActivityLogId] = useState<
    number | ''
  >(existingSessionId && activities.length > 0 ? activities[0].id : '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<ServiceUserOption[]>([]);
  const [userOptions, setUserOptions] = useState<ServiceUserOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingSession, setExistingSession] = useState<any>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUserOptions = async () => {
      if (debouncedSearchQuery) {
        logger.debug('Fetching user options', { query: debouncedSearchQuery });
        try {
          const response = await apiClient.get('/api/service-users/search', {
            params: { q: debouncedSearchQuery, includeDischarged: 'false' },
          });
          const admittedUsers = response.serviceUsers
            .filter((user: any) =>
              user.admissions.some((adm: any) => !adm.dischargeDate),
            )
            .map((user: any) => ({
              id: user.id,
              name: user.name,
              nhsNumber: user.nhsNumber,
              ward: user.admissions[0]?.ward.name || 'Unknown',
            }));
          setUserOptions(
            admittedUsers.filter(
              (u: ServiceUserOption) =>
                !selectedUsers.some((su) => su.id === u.id),
            ),
          );
          logger.info('User options fetched', { count: admittedUsers.length });
        } catch (error) {
          logger.error('Failed to fetch user options', { error });
          toast.error('Failed to load service users. Please try again.');
        }
      } else {
        setUserOptions([]);
        logger.debug('Search query cleared, resetting user options');
      }
    };
    fetchUserOptions();
  }, [debouncedSearchQuery, selectedUsers]);

  const checkExistingSession = useCallback(async () => {
    if (existingSessionId) {
      logger.debug('Checking existing session by ID', { existingSessionId });
      try {
        const response = await apiClient.get(
          `/api/sessions/${existingSessionId}`,
        );
        setExistingSession(response);
        logger.info('Existing session fetched', {
          sessionId: existingSessionId,
        });
      } catch (error) {
        logger.error('Failed to fetch existing session', { error });
        toast.error('Failed to check existing session. Please try again.');
      }
    } else if (selectedActivityLogId) {
      logger.debug('Checking for active sessions by activityLogId', {
        selectedActivityLogId,
      });
      try {
        const response = await apiClient.get('/api/group-sessions', {
          params: { type: 'GROUP', activityLogId: selectedActivityLogId },
        });
        const activeSessions = response.sessions;
        if (activeSessions.length > 0) {
          setExistingSession(activeSessions[0]);
          logger.info('Found existing active session', {
            groupRef: activeSessions[0].groupRef,
          });
        } else {
          setExistingSession(null);
          logger.info('No existing active session found');
        }
      } catch (error) {
        logger.error('Failed to check for active sessions', { error });
        toast.error('Failed to check for active sessions. Please try again.');
      }
    }
  }, [selectedActivityLogId, existingSessionId]);

  useEffect(() => {
    if (selectedActivityLogId || existingSessionId) {
      checkExistingSession();
    }
  }, [checkExistingSession]);

  const handleAddUser = (user: ServiceUserOption) => {
    logger.debug('Adding user to selection', {
      userId: user.id,
      name: user.name,
    });
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery('');
    setUserOptions((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleRemoveUser = (userId: number) => {
    logger.debug('Removing user from selection', { userId });
    const removedUser = selectedUsers.find((u) => u.id === userId);
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    if (removedUser) {
      setUserOptions((prev) => [...prev, removedUser]);
    }
  };

  const startSession = async () => {
    if (!selectedActivityLogId) {
      logger.warn('No activity selected');
      toast.error('Please select an activity.');
      return;
    }
    if (selectedUsers.length === 0) {
      logger.warn('No users selected');
      toast.error('Please select at least one service user.');
      return;
    }

    setLoading(true);
    logger.info('Starting group session', {
      selectedActivityLogId,
      userCount: selectedUsers.length,
    });
    try {
      const admissionIds = selectedUsers
        .map((u) => admissions.find((a) => a.serviceUser.id === u.id)?.id)
        .filter((id): id is number => id !== undefined);

      if (admissionIds.length !== selectedUsers.length) {
        logger.error('Mismatch in admission IDs', {
          selectedUsers: selectedUsers.length,
          validAdmissions: admissionIds.length,
        });
        toast.error('One or more selected users do not have valid admissions.');
        return;
      }

      if (existingSession && !existingSessionId) {
        logger.debug('Prompting to add users to existing session', {
          groupRef: existingSession.groupRef,
        });
        const confirmAdd = window.confirm(
          `An active group session for "${activities.find((a) => a.id === selectedActivityLogId)?.name}" is ongoing. Do you want to add these users to it?`,
        );
        if (confirmAdd) {
          await Promise.all(
            admissionIds.map((admissionId) =>
              apiClient.post(
                `/api/sessions/group/${existingSession.groupRef}/join`,
                {
                  admissionId,
                },
              ),
            ),
          );
          logger.info('Users added to existing group session', {
            admissionIds,
          });
          toast.success('Users added to existing group session successfully!');
        } else {
          logger.info('User canceled adding to existing session');
          return;
        }
      } else if (existingSessionId) {
        logger.debug('Adding users to specified existing session', {
          existingSessionId,
        });
        await Promise.all(
          admissionIds.map((admissionId) =>
            apiClient.post(
              `/api/sessions/group/${existingSession.groupRef}/join`,
              {
                admissionId,
              },
            ),
          ),
        );
        logger.info('Users added to group session', { admissionIds });
        toast.success('Users added to group session successfully!');
      } else {
        const payload = {
          type: 'GROUP',
          activityLogId: Number(selectedActivityLogId),
          admissionIds,
        };
        logger.debug('Submitting new group session payload', { payload });
        const response = await apiClient.post('/api/group-sessions', payload);
        logger.info('Group session created', { response: response.sessions });
        toast.success('Group session created successfully!');
      }
      onSessionCreated();
      onClose();
    } catch (error: any) {
      logger.error('Failed to start group session', {
        error: error.message,
        response: error.response?.data,
      });
      toast.error(
        error.response?.data?.error ||
          'Failed to start group session. Please try again.',
      );
    } finally {
      setLoading(false);
      logger.debug('Session creation attempt completed', { loading: false });
    }
  };

  if (isActivitiesLoading || isAdmissionsLoading) {
    logger.debug('Loading activities or admissions');
    return <div>Loading activities and admissions...</div>;
  }

  return (
    <Modal show={isOpen} handleClose={onClose} ariaLabel="Create Group Session">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center bg-green-500 text-white p-4 rounded-t-xl">
          <h3 className="text-xl font-bold">
            {existingSessionId
              ? 'Add Users to Group Session'
              : 'Start a Group Session'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-300 focus:outline-none"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="form-control">
              <label className="label" htmlFor="activityLogId">
                <span className="label-text font-medium text-gray-900 dark:text-gray-100">
                  Select Activity
                </span>
              </label>
              <select
                id="activityLogId"
                value={selectedActivityLogId}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSelectedActivityLogId(value);
                  logger.debug('Activity selected', { activityLogId: value });
                }}
                className="select select-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-300"
                disabled={!!existingSessionId}
              >
                <option value="">Choose an Activity</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="userSearch">
                <span className="label-text font-medium text-gray-900 dark:text-gray-100">
                  Add Service Users
                </span>
              </label>
              <input
                id="userSearch"
                type="text"
                placeholder="Type to search admitted users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 transition-all duration-300"
              />
              {userOptions.length > 0 && (
                <ul className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {userOptions.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => handleAddUser(user)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAddUser(user);
                        }
                      }}
                      tabIndex={0}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 flex items-center"
                    >
                      <span className="font-medium">{user.name}</span>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        (Ward: {user.ward}, NHS: {user.nhsNumber})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-900 dark:text-gray-100">
                  Selected Users
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="badge badge-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-full px-3 py-1 flex items-center"
                  >
                    {user.name}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-control">
              <button
                onClick={startSession}
                className={`btn w-full bg-green-500 hover:bg-green-600 text-white rounded-lg transform hover:scale-105 transition-all duration-300 ${loading ? 'btn-disabled' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : existingSessionId ? (
                  'Add Users'
                ) : (
                  'Start Group Session'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default GroupSessionModal;
// src/features/Sessions/ui/GroupSessionModal.tsx
