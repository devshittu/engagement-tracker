// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

// src/features/Sessions/ui/BackdatedGroupSessionModal.tsx
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchServiceUsers } from '@/features/Search/hooks/useSearchServiceUsers';
import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';
import { useCreateBackdatedSession } from '../hooks/useCreateBackdatedSession';
import { logger } from '@/lib/logger';
import { useDebounce } from '@/hooks/useDebounce';
import { TimePickerWidget } from './TimePickerWidget';

type ServiceUserOption = {
  id: number;
  name: string;
  nhsNumber: string;
  ward: string;
};

interface BackdatedGroupSessionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BackdatedGroupSessionModal = ({
  isOpen,
  setIsOpen,
}: BackdatedGroupSessionModalProps) => {
  const { data: activities = [], isLoading: isActivitiesLoading } =
    useActiveActivities();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data, fetchNextPage, hasNextPage, isFetching } =
    useSearchServiceUsers({
      q: debouncedSearchQuery,
      sortBy: 'name',
      order: 'asc',
    });
  const { mutate: createSession, isPending } = useCreateBackdatedSession();
  const [selectedUsers, setSelectedUsers] = useState<ServiceUserOption[]>([]);
  const [userOptions, setUserOptions] = useState<ServiceUserOption[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null,
  );
  const [timeIn, setTimeIn] = useState<Date | null>(null);
  const [timeOut, setTimeOut] = useState<Date | null>(null);
  const [groupDescription, setGroupDescription] = useState<string>('');

  useEffect(() => {
    if (data) {
      const allUsers = data.pages.flatMap((page) => page.serviceUsers);
      const filteredUsers = allUsers
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
        filteredUsers.filter(
          (u) => !selectedUsers.some((su) => su.id === u.id),
        ),
      );
    }
  }, [data, selectedUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

  const generateGroupRef = (activityId: number, timeIn: Date): string => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }
    const activityName = activity.name.toLowerCase().replace(/\s+/g, '_');
    const timestamp = timeIn
      .toISOString()
      .replace(/[-:T.]/g, '_')
      .slice(0, 19);
    return `${activityName}_${timestamp}`;
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0 || !selectedActivityId || !timeIn) {
      alert('Please select at least one user, an activity, and a start time.');
      return;
    }

    const groupRef = generateGroupRef(selectedActivityId, timeIn);

    createSession(
      {
        type: 'GROUP',
        admissionIds: selectedUsers.map((u) => u.id),
        activityLogId: selectedActivityId,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut?.toISOString(),
        groupRef,
        groupDescription: groupDescription || undefined, // Optional field
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedUsers([]);
          setSelectedActivityId(null);
          setTimeIn(null);
          setTimeOut(null);
          setGroupDescription('');
        },
      },
    );
  };

  if (isActivitiesLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 text-left transition-all">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center p-4">
                    <Dialog.Title
                      as="h2"
                      className="text-2xl font-bold text-gray-900"
                    >
                      Create Backdated Group Session
                    </Dialog.Title>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
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
                      <label
                        htmlFor="activityLogId"
                        className="label-text font-medium text-gray-900"
                      >
                        Select Activity
                      </label>
                      <select
                        id="activityLogId"
                        value={selectedActivityId ?? ''}
                        onChange={(e) =>
                          setSelectedActivityId(Number(e.target.value))
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
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
                      <label
                        htmlFor="userSearch"
                        className="label-text font-medium text-gray-900"
                      >
                        Add Service Users
                      </label>
                      <input
                        id="userSearch"
                        type="text"
                        placeholder="Type to search admitted users..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="input input-bordered w-full rounded-lg focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                      />
                      {userOptions.length > 0 && (
                        <ul className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
                          {userOptions.map((user) => (
                            <li key={user.id}>
                              <button
                                onClick={() => handleAddUser(user)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 flex items-center w-full text-left"
                              >
                                <span className="font-medium">{user.name}</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  (Ward: {user.ward}, NHS: {user.nhsNumber})
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="form-control">
                      <div className="label-text font-medium text-gray-900">
                        Selected Users
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="badge badge-lg bg-teal-100 text-teal-800 border border-teal-300 rounded-full px-3 py-1 flex items-center"
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
                      <label
                        htmlFor="groupDescription"
                        className="label-text font-medium text-gray-900"
                      >
                        Group Description (Optional)
                      </label>
                      <input
                        id="groupDescription"
                        type="text"
                        placeholder="Enter group description (optional)"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="input input-bordered mt-1 block w-full rounded-md border-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      />
                    </div>
                    <div className="form-control">
                      <label
                        htmlFor="timeIn"
                        className="label-text font-medium text-gray-900"
                      >
                        Start Time
                      </label>
                      <TimePickerWidget
                        selected={timeIn}
                        onChange={(date) => setTimeIn(date)}
                      />
                    </div>
                    <div className="form-control">
                      <label
                        htmlFor="timeOut"
                        className="label-text font-medium text-gray-900"
                      >
                        End Time (Optional)
                      </label>
                      <TimePickerWidget
                        selected={timeOut}
                        onChange={(date) => setTimeOut(date)}
                      />
                    </div>
                    <div className="form-control">
                      <button
                        id="submitButton"
                        onClick={handleSubmit}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-lg py-2 transition-all duration-300 disabled:opacity-50"
                        disabled={isPending}
                      >
                        {isPending ? 'Creating...' : 'Create Session'}
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
// src/features/Sessions/ui/BackdatedGroupSessionModal.tsx
