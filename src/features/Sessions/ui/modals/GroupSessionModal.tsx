// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

// src/features/Sessions/ui/GroupSessionModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
  groupRef?: string;
  activityLogId?: number;
  context?: 'search' | 'group-card';
};

const GroupSessionModal: React.FC<GroupSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated,
  existingSessionId,
  groupRef,
  activityLogId,
  context = 'search',
}) => {
  const { data: activities = [], isLoading: isActivitiesLoading } =
    useActiveActivities();
  const { data: admissions = [], isLoading: isAdmissionsLoading } =
    useActiveAdmissions();
  const [selectedActivityLogId, setSelectedActivityLogId] = useState<
    number | ''
  >(context === 'group-card' && activityLogId ? activityLogId : '');
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
    if (existingSessionId && groupRef) {
      logger.debug('Checking existing session by ID', {
        existingSessionId,
        groupRef,
      });
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
    } else if (selectedActivityLogId && !existingSessionId) {
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
  }, [selectedActivityLogId, existingSessionId, groupRef]);

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
          `An active group session for "${
            activities.find((a) => a.id === selectedActivityLogId)?.name
          }" is ongoing. Do you want to add these users to it?`,
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
      } else if (existingSessionId && groupRef) {
        logger.debug('Adding users to specified existing session', {
          existingSessionId,
          groupRef,
        });
        await Promise.all(
          admissionIds.map((admissionId) =>
            apiClient.post(`/api/sessions/group/${groupRef}/join`, {
              admissionId,
            }),
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
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg min-w-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-xl transform transition-all">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-t-xl">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {existingSessionId
                        ? 'Add Users to Group Session'
                        : 'Start a Group Session'}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                  <div className="p-6 space-y-6">
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
                          logger.debug('Activity selected', {
                            activityLogId: value,
                          });
                        }}
                        className="select select-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all duration-300 disabled:opacity-50"
                        disabled={context === 'group-card' && !!activityLogId}
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
                        className="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                      />
                      {userOptions.length > 0 && (
                        <ul className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-h-40 overflow-y-auto">
                          {userOptions.map((user) => (
                            <li key={user.id}>
                              <button
                                onClick={() => handleAddUser(user)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleAddUser(user);
                                  }
                                }}
                                tabIndex={0}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 flex items-center w-full text-left"
                              >
                                <span className="font-medium">{user.name}</span>
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                  (Ward: {user.ward}, NHS: {user.nhsNumber})
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="form-control">
                      <div className="label">
                        <span className="label-text font-medium text-gray-900 dark:text-gray-100">
                          Selected Users
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="badge badge-lg bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 rounded-full px-3 py-1 flex items-center"
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
                        className={`btn w-full bg-teal-500 hover:bg-teal-600 text-white rounded-lg transform hover:scale-105 transition-all duration-300 ${loading ? 'btn-disabled' : ''}`}
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
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GroupSessionModal;
// src/features/Sessions/ui/GroupSessionModal.tsx
