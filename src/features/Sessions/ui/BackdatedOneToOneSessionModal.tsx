// src/features/Sessions/ui/BackdatedOneToOneSessionModal.tsx
// 'use client';

// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment, useState } from 'react';
// import { TimePickerWidget } from './TimePickerWidget';
// import { useActiveAdmissions } from '@/features/admissions/hooks/useActiveAdmissions';
// import { useActiveActivities } from '@/features/activities/hooks/useActiveActivities';
// import { useCreateBackdatedSession } from '../hooks/useCreateBackdatedSession';

// interface BackdatedOneToOneSessionModalProps {
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
// }

// export const BackdatedOneToOneSessionModal = ({
//   isOpen,
//   setIsOpen,
// }: BackdatedOneToOneSessionModalProps) => {
//   const { data: admissions, isLoading: admissionsLoading } =
//     useActiveAdmissions();
//   const { data: activities, isLoading: activitiesLoading } =
//     useActiveActivities();
//   const { mutate: createSession, isPending } = useCreateBackdatedSession();

//   const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(
//     null,
//   );
//   const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
//     null,
//   );
//   const [timeIn, setTimeIn] = useState<Date | null>(null);
//   const [timeOut, setTimeOut] = useState<Date | null>(null);

//   const handleSubmit = () => {
//     if (!selectedAdmissionId || !selectedActivityId || !timeIn) {
//       alert('Please fill in all required fields.');
//       return;
//     }

//     createSession(
//       {
//         type: 'ONE_TO_ONE',
//         admissionIds: [selectedAdmissionId],
//         activityLogId: selectedActivityId,
//         timeIn: timeIn.toISOString(),
//         timeOut: timeOut?.toISOString(),
//       },
//       {
//         onSuccess: () => {
//           setIsOpen(false);
//           setSelectedAdmissionId(null);
//           setSelectedActivityId(null);
//           setTimeIn(null);
//           setTimeOut(null);
//         },
//       },
//     );
//   };

//   if (admissionsLoading || activitiesLoading) {
//     return (
//       <div className="text-center text-gray-500 dark:text-gray-400">
//         <span className="loading loading-spinner loading-lg"></span> Loading...
//       </div>
//     );
//   }

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog
//         as="div"
//         className="relative z-10"
//         onClose={() => setIsOpen(false)}
//       >
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-25" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                 <Dialog.Title
//                   as="h3"
//                   className="text-lg font-medium leading-6 text-gray-900"
//                 >
//                   Create Backdated One-to-One Session
//                 </Dialog.Title>
//                 <div className="mt-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Admission
//                     </label>
//                     <select
//                       value={selectedAdmissionId ?? ''}
//                       onChange={(e) =>
//                         setSelectedAdmissionId(Number(e.target.value))
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
//                     >
//                       <option value="">Select an admission</option>
//                       {admissions?.length ? (
//                         admissions.map((admission) => (
//                           <option key={admission.id} value={admission.id}>
//                             {admission.serviceUser.name} - {admission.serviceUser.nhsNumber} -{' '}
//                             {admission.admissionDate?.toLocaleDateString() ??
//                               'Unknown Date'}
//                           </option>
//                         ))
//                       ) : (
//                         <option value="">No admissions available</option>
//                       )}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Activity
//                     </label>
//                     <select
//                       value={selectedActivityId ?? ''}
//                       onChange={(e) =>
//                         setSelectedActivityId(Number(e.target.value))
//                       }
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
//                     >
//                       <option value="">Select an activity</option>
//                       {activities?.length ? (
//                         activities.map((activity) => (
//                           <option key={activity.id} value={activity.id}>
//                             {activity.name}
//                           </option>
//                         ))
//                       ) : (
//                         <option value="">No activities available</option>
//                       )}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Start Time
//                     </label>
//                     <TimePickerWidget selected={timeIn} onChange={setTimeIn} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       End Time (Optional)
//                     </label>
//                     <TimePickerWidget
//                       selected={timeOut}
//                       onChange={setTimeOut}
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-6 flex justify-end space-x-2">
//                   <button
//                     type="button"
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 disabled:opacity-50"
//                     onClick={handleSubmit}
//                     disabled={isPending}
//                   >
//                     {isPending ? 'Creating...' : 'Create Session'}
//                   </button>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
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

interface BackdatedOneToOneSessionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const BackdatedOneToOneSessionModal = ({
  isOpen,
  setIsOpen,
}: BackdatedOneToOneSessionModalProps) => {
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
  const [selectedUser, setSelectedUser] = useState<ServiceUserOption | null>(
    null,
  );
  const [userOptions, setUserOptions] = useState<ServiceUserOption[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null,
  );
  const [timeIn, setTimeIn] = useState<Date | null>(null);
  const [timeOut, setTimeOut] = useState<Date | null>(null);

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
      setUserOptions(filteredUsers.filter((u) => u.id !== selectedUser?.id));
    }
  }, [data, selectedUser]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddUser = (user: ServiceUserOption) => {
    logger.debug('Adding user to selection', {
      userId: user.id,
      name: user.name,
    });
    setSelectedUser(user);
    setSearchQuery('');
    setUserOptions((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleRemoveUser = () => {
    if (selectedUser) {
      logger.debug('Removing user from selection', { userId: selectedUser.id });
      setSelectedUser(null);
      setUserOptions((prev) => [...prev, selectedUser]);
    }
  };

  const handleSubmit = () => {
    if (!selectedUser || !selectedActivityId || !timeIn) {
      alert('Please select a user, an activity, and a start time.');
      return;
    }

    createSession(
      {
        type: 'ONE_TO_ONE',
        admissionIds: [selectedUser.id],
        activityLogId: selectedActivityId,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut?.toISOString(),
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSelectedUser(null);
          setSelectedActivityId(null);
          setTimeIn(null);
          setTimeOut(null);
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
                      Create Backdated One-to-One Session
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
                        Add Service User
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
                        Selected User
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser && (
                          <div className="badge badge-lg bg-teal-100 text-teal-800 border border-teal-300 rounded-full px-3 py-1 flex items-center">
                            {selectedUser.name}
                            <button
                              onClick={handleRemoveUser}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
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
// src/features/Sessions/ui/BackdatedOneToOneSessionModal.tsx
