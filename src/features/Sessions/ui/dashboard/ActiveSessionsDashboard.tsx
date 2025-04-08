// src/features/Sessions/ui/ActiveSessionsDashboard.tsx

// 'use client';

// import React, { useCallback, useMemo, useEffect } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { toast } from 'react-toastify';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Dialog, Transition } from '@headlessui/react';
// import {
//   useActiveSessions,
//   useActiveSessionsCounts,
// } from '../hooks/useActiveSessions';
// import { useDeclineSession } from '../hooks/useDeclineSession';
// import ElapsedTime from './ElapsedTime';
// import GroupSessionCard from './GroupSessionCard';
// import DeclineSessionModal from './DeclineSessionModal';
// import Modal from '@/components/Modal/Modal';
// import { motion } from 'framer-motion';
// import { apiClient } from '@/lib/api-client';
// import { logger } from '@/lib/logger';

// const ActiveSessionsDashboard: React.FC = () => {
//   const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
//   const [showEndAllOneToOneModal, setShowEndAllOneToOneModal] = React.useState(false);
//   const [showEndAllGroupModal, setShowEndAllGroupModal] = React.useState(false);
//   const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
//   const [decliningSession, setDecliningSession] = React.useState<{
//     id: number;
//     serviceUserName: string;
//     activityName: string;
//   } | null>(null);

//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { declineReasons, declineSession, isLoadingReasons } = useDeclineSession();

//   useEffect(() => {
//     logger.debug('decliningSession state updated in ActiveSessionsDashboard', { decliningSession, isDeclineModalOpen });
//   }, [decliningSession, isDeclineModalOpen]);

//   const {
//     oneToOneCount,
//     groupCount,
//     isLoading: isCountsLoading,
//     error: countsError,
//   } = useActiveSessionsCounts();
//   const {
//     data: oneToOneData,
//     isLoading: isOneToOneLoading,
//     error: oneToOneError,
//   } = useActiveSessions({
//     sortBy: 'timeIn',
//     order: sortOrder,
//     type: 'ONE_TO_ONE',
//   });
//   const {
//     data: groupData,
//     isLoading: isGroupLoading,
//     error: groupError,
//   } = useActiveSessions({
//     sortBy: 'timeIn',
//     order: sortOrder,
//     type: 'GROUP',
//     groupByGroupRef: true,
//   });

//   const totalActive = (oneToOneData?.total ?? 0) + (groupData?.total ?? 0);
//   const oneToOneSessions = useMemo(
//     () => ('sessions' in (oneToOneData ?? {}) ? oneToOneData.sessions : []),
//     [oneToOneData],
//   );
//   const groupSessions = useMemo(
//     () => ('groups' in (groupData ?? {}) ? groupData.groups : []),
//     [groupData],
//   );
//   const sessionsToDisplay = useMemo(
//     () => oneToOneSessions.slice(0, 6 - groupSessions.length),
//     [oneToOneSessions, groupSessions],
//   );

//   const toggleSortOrder = useCallback(() => {
//     logger.info('Toggling sort order', { previous: sortOrder, new: sortOrder === 'asc' ? 'desc' : 'asc' });
//     setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
//   }, [sortOrder]);

//   const endSessionMutation = useMutation({
//     mutationFn: async (sessionId: number) => {
//       logger.info('Ending session', { sessionId });
//       const response = await apiClient.post(`/api/sessions/${sessionId}/end`, { id: sessionId });
//       return response;
//     },
//     onSuccess: () => {
//       logger.info('Session ended successfully', { sessionId: endSessionMutation.variables });
//       toast.success('Session ended successfully!');
//       queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }] });
//     },
//     onError: (err: any) => {
//       logger.error('Failed to end session', { sessionId: endSessionMutation.variables, error: err.message });
//       toast.error(err.message || 'Failed to end session');
//     },
//   });

//   const endAllOneToOneMutation = useMutation({
//     mutationFn: async () => {
//       logger.info('Ending all one-to-one sessions', { count: oneToOneCount });
//       const response = await apiClient.post('/api/sessions/end-all/one-to-one');
//       return response;
//     },
//     onSuccess: () => {
//       logger.info('All one-to-one sessions ended successfully', { count: oneToOneCount });
//       toast.success('All one-to-one sessions ended successfully!');
//       queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }] });
//       setShowEndAllOneToOneModal(false);
//     },
//     onError: (err: any) => {
//       logger.error('Failed to end all one-to-one sessions', { error: err.message });
//       toast.error(err.message || 'Failed to end all one-to-one sessions');
//     },
//   });

//   const endAllGroupMutation = useMutation({
//     mutationFn: async () => {
//       logger.info('Ending all group sessions', { count: groupCount });
//       const response = await apiClient.post('/api/sessions/end-all/group');
//       return response;
//     },
//     onSuccess: () => {
//       logger.info('All group sessions ended successfully', { count: groupCount });
//       toast.success('All group sessions ended successfully!');
//       queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'GROUP' }] });
//       setShowEndAllGroupModal(false);
//     },
//     onError: (err: any) => {
//       logger.error('Failed to end all group sessions', { error: err.message });
//       toast.error(err.message || 'Failed to end all group sessions');
//     },
//   });

//   const handleDeclineClick = useCallback(
//     (session: any) => (event: React.MouseEvent) => {
//       event.stopPropagation();
//       event.preventDefault();
//       const decliningData = {
//         id: session.id,
//         serviceUserName: session.admission.serviceUser.name,
//         activityName: session.activityLog.activity.name,
//       };
//       logger.info('Decline button clicked in ActiveSessionsDashboard', decliningData);
//       setDecliningSession(decliningData);
//       setIsDeclineModalOpen(true);
//       logger.debug('Opening decline modal', { decliningData });
//     },
//     [],
//   );

//   const handleDeclineSubmit = useCallback(
//     (sessionId: number, declineReasonId: number, description: string | null) => {
//       logger.info('Submitting decline in ActiveSessionsDashboard', { sessionId, declineReasonId, description });
//       declineSession({ sessionId, declineReasonId, description });
//       setDecliningSession(null);
//       setIsDeclineModalOpen(false);
//     },
//     [declineSession],
//   );

//   const handleCloseModal = useCallback(() => {
//     logger.info('Closing decline modal in ActiveSessionsDashboard', { sessionId: decliningSession?.id });
//     setDecliningSession(null);
//     setIsDeclineModalOpen(false);
//   }, [decliningSession]);

//   if (isOneToOneLoading || isGroupLoading || isCountsLoading || isLoadingReasons) {
//     logger.debug('Loading state detected', { isOneToOneLoading, isGroupLoading, isCountsLoading, isLoadingReasons });
//     return (
//       <div className="text-center text-gray-500 dark:text-gray-400">
//         <span className="loading loading-spinner loading-lg"></span> Loading active sessions...
//       </div>
//     );
//   }

//   if (countsError || oneToOneError || groupError) {
//     logger.error('Error loading sessions', { countsError: countsError?.message, oneToOneError: oneToOneError?.message, groupError: groupError?.message });
//     return (
//       <p className="text-center text-red-500">
//         Error loading sessions: {(countsError || oneToOneError || groupError)?.message}
//       </p>
//     );
//   }

//   if (totalActive === 0) {
//     logger.info('No active sessions', { totalActive });
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col items-center justify-center text-center min-h-[40vh]"
//       >
//         <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
//           No Active Sessions
//         </h2>
//         <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mb-4">
//           To start a session, use the search box below to find a service user you want to engage.
//         </p>
//         <p className="text-base text-gray-500 dark:text-gray-400">
//           <em>Then come back here once a session is started!</em>
//         </p>
//       </motion.div>
//     );
//   }

//   logger.debug('Rendering ActiveSessionsDashboard', { oneToOneCount, groupCount, decliningSession });

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
//           Active Sessions
//         </h1>
//         <div className="flex flex-wrap items-center space-x-4 mt-4 md:mt-0">
//           <div className="badge badge-lg bg-teal-500 text-white">
//             Total Active: {totalActive}
//           </div>
//           <button
//             className="btn btn-outline hover:bg-teal-500 hover:text-white"
//             onClick={toggleSortOrder}
//           >
//             {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
//           </button>
//           <button
//             onClick={() => {
//               logger.info('Opening end all one-to-one modal', { count: oneToOneCount });
//               setShowEndAllOneToOneModal(true);
//             }}
//             className={`btn bg-red-500 hover:bg-red-600 text-white ${oneToOneCount === 0 ? 'btn-disabled' : ''}`}
//             disabled={oneToOneCount === 0}
//           >
//             End All One-to-One ({oneToOneCount})
//           </button>
//           <button
//             onClick={() => {
//               logger.info('Opening end all group modal', { count: groupCount });
//               setShowEndAllGroupModal(true);
//             }}
//             className={`btn bg-red-600 hover:bg-red-700 text-white ${groupCount === 0 ? 'btn-disabled' : ''}`}
//             disabled={groupCount === 0}
//           >
//             End All Group ({groupCount})
//           </button>
//           <Link
//             href="/sessions/declined"
//             className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
//           >
//             View Declined
//           </Link>
//           {totalActive > 6 && (
//             <Link
//               href="/sessions/active"
//               className="btn bg-teal-500 hover:bg-teal-600 text-white"
//             >
//               View All
//             </Link>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {groupSessions.map((group: any) => (
//           <GroupSessionCard
//             key={group.groupRef}
//             groupRef={group.groupRef}
//             groupDescription={group.groupDescription}
//             sessions={group.sessions}
//           />
//         ))}
//         {sessionsToDisplay.map((session: any) => (
//           <motion.div
//             key={session.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
//           >
//             <div className="card-body">
//               <h2 className="card-title text-xl text-gray-900 dark:text-gray-100">
//                 {session.admission.serviceUser.name}
//               </h2>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 <strong>Activity:</strong> {session.activityLog.activity.name}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 <strong>Ward:</strong> {session.admission.ward.name}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 <strong>Time In:</strong> {new Date(session.timeIn).toLocaleString()}
//               </p>
//               <div className="my-4">
//                 <ElapsedTime timeIn={session.timeIn} timeOut={session.timeOut} big />
//               </div>
//               <div className="card-actions justify-between space-x-2">
//                 {!session.timeOut && (
//                   <>
//                     <button
//                       onClick={handleDeclineClick(session)}
//                       className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
//                     >
//                       Decline
//                     </button>
//                     <button
//                       onClick={() => endSessionMutation.mutate(session.id)}
//                       className="btn bg-red-500 hover:bg-red-600 text-white"
//                     >
//                       End Session
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Existing Modals with Modal.tsx */}
//       <Modal
//         show={showEndAllOneToOneModal}
//         handleClose={() => {
//           logger.info('Closing end all one-to-one modal');
//           setShowEndAllOneToOneModal(false);
//         }}
//         ariaLabel="Confirm End All One-to-One Sessions"
//       >
//         <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow-xl">
//           <div className="mb-4">
//             <svg
//               className="w-12 h-12 mx-auto text-red-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//             End All One-to-One Sessions
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             Are you sure you want to end all {oneToOneCount} active one-to-one sessions? This action cannot be undone.
//           </p>
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={() => setShowEndAllOneToOneModal(false)}
//               className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => endAllOneToOneMutation.mutate()}
//               className={`btn bg-red-500 hover:bg-red-600 text-white rounded-lg ${endAllOneToOneMutation.isPending ? 'btn-disabled' : ''}`}
//               disabled={endAllOneToOneMutation.isPending}
//             >
//               {endAllOneToOneMutation.isPending ? (
//                 <span className="loading loading-spinner"></span>
//               ) : (
//                 'Confirm'
//               )}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         show={showEndAllGroupModal}
//         handleClose={() => {
//           logger.info('Closing end all group modal');
//           setShowEndAllGroupModal(false);
//         }}
//         ariaLabel="Confirm End All Group Sessions"
//       >
//         <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow-xl">
//           <div className="mb-4">
//             <svg
//               className="w-12 h-12 mx-auto text-red-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//             End All Group Sessions
//           </h3>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             Are you sure you want to end all {groupCount} active group sessions? This action cannot be undone.
//           </p>
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={() => setShowEndAllGroupModal(false)}
//               className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={() => endAllGroupMutation.mutate()}
//               className={`btn bg-red-500 hover:bg-red-600 text-white rounded-lg ${endAllGroupMutation.isPending ? 'btn-disabled' : ''}`}
//               disabled={endAllGroupMutation.isPending}
//             >
//               {endAllGroupMutation.isPending ? (
//                 <span className="loading loading-spinner"></span>
//               ) : (
//                 'Confirm'
//               )}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* New Headless UI Dialog for DeclineSessionModal */}
//       {decliningSession && (
//         <Transition appear show={isDeclineModalOpen} as={React.Fragment}>
//           <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
//             <Transition.Child
//               as={React.Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0"
//               enterTo="opacity-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100"
//               leaveTo="opacity-0"
//             >
//               <div className="fixed inset-0 bg-black bg-opacity-25" />
//             </Transition.Child>

//             <div className="fixed inset-0 overflow-y-auto">
//               <div className="flex min-h-full items-center justify-center p-4 text-center">
//                 <Transition.Child
//                   as={React.Fragment}
//                   enter="ease-out duration-300"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="ease-in duration-200"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
//                     <DeclineSessionModal
//                       show={isDeclineModalOpen}
//                       sessionId={decliningSession.id}
//                       serviceUserName={decliningSession.serviceUserName}
//                       activityName={decliningSession.activityName}
//                       declineReasons={declineReasons}
//                       onDecline={handleDeclineSubmit}
//                       onClose={handleCloseModal}
//                     />
//                   </Dialog.Panel>
//                 </Transition.Child>
//               </div>
//             </div>
//           </Dialog>
//         </Transition>
//       )}
//     </div>
//   );
// };

// export default ActiveSessionsDashboard;
'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import {
  useActiveSessions,
  useActiveSessionsCounts,
} from '@/features/Sessions/hooks/useActiveSessions';
import { useDeclineSession } from '@/features/Sessions/hooks/useDeclineSession';
import ElapsedTime from '../ElapsedTime';
import GroupSessionCard from '../cards/GroupSessionCard';
import DeclineSessionModal from '../modals/DeclineSessionModal';
import ConfirmationDialog from '@/components/ui/modals/ConfirmationDialog';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

const ActiveSessionsDashboard: React.FC = () => {
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [showEndAllOneToOneModal, setShowEndAllOneToOneModal] = React.useState(false);
  const [showEndAllGroupModal, setShowEndAllGroupModal] = React.useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = React.useState(false);
  const [decliningSession, setDecliningSession] = React.useState<{
    id: number;
    serviceUserName: string;
    activityName: string;
  } | null>(null);
  const [endingSession, setEndingSession] = React.useState<{
    id: number;
    serviceUserName: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const { declineReasons, declineSession, isLoadingReasons } = useDeclineSession();

  useEffect(() => {
    logger.debug('State updated in ActiveSessionsDashboard', {
      decliningSession,
      isDeclineModalOpen,
      endingSession,
      isEndSessionModalOpen,
      showEndAllOneToOneModal,
      showEndAllGroupModal,
    });
  }, [decliningSession, isDeclineModalOpen, endingSession, isEndSessionModalOpen, showEndAllOneToOneModal, showEndAllGroupModal]);

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
    logger.info('Toggling sort order', { previous: sortOrder, new: sortOrder === 'asc' ? 'desc' : 'asc' });
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, [sortOrder]);

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      logger.info('Ending session', { sessionId });
      const response = await apiClient.post(`/api/sessions/${sessionId}/end`, { id: sessionId });
      return response;
    },
    onSuccess: () => {
      logger.info('Session ended successfully', { sessionId: endSessionMutation.variables });
      toast.success('Session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }] });
      setEndingSession(null);
      setIsEndSessionModalOpen(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end session', { sessionId: endSessionMutation.variables, error: err.message });
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
      logger.info('All one-to-one sessions ended successfully', { count: oneToOneCount });
      toast.success('All one-to-one sessions ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'ONE_TO_ONE' }] });
      setShowEndAllOneToOneModal(false);
    },
    onError: (err: any) => {
      logger.error('Failed to end all one-to-one sessions', { error: err.message });
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
      logger.info('All group sessions ended successfully', { count: groupCount });
      toast.success('All group sessions ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessions', { type: 'GROUP' }] });
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
      logger.info('Decline button clicked in ActiveSessionsDashboard', decliningData);
      setDecliningSession(decliningData);
      setIsDeclineModalOpen(true);
      logger.debug('Opening decline modal', { decliningData });
    },
    [],
  );

  const handleEndSessionClick = useCallback(
    (sessionId: number, serviceUserName: string) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      logger.info('End session clicked in ActiveSessionsDashboard', { sessionId, serviceUserName });
      setEndingSession({ id: sessionId, serviceUserName });
      setIsEndSessionModalOpen(true);
    },
    [],
  );

  const handleDeclineSubmit = useCallback(
    (sessionId: number, declineReasonId: number, description: string | null) => {
      logger.info('Submitting decline in ActiveSessionsDashboard', { sessionId, declineReasonId, description });
      declineSession({ sessionId, declineReasonId, description });
      setDecliningSession(null);
      setIsDeclineModalOpen(false);
    },
    [declineSession],
  );

  const handleCloseDeclineModal = useCallback(() => {
    logger.info('Closing decline modal in ActiveSessionsDashboard', { sessionId: decliningSession?.id });
    setDecliningSession(null);
    setIsDeclineModalOpen(false);
  }, [decliningSession]);

  if (isOneToOneLoading || isGroupLoading || isCountsLoading || isLoadingReasons) {
    logger.debug('Loading state detected', { isOneToOneLoading, isGroupLoading, isCountsLoading, isLoadingReasons });
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <span className="loading loading-spinner loading-lg"></span> Loading active sessions...
      </div>
    );
  }

  if (countsError || oneToOneError || groupError) {
    logger.error('Error loading sessions', { countsError: countsError?.message, oneToOneError: oneToOneError?.message, groupError: groupError?.message });
    return (
      <p className="text-center text-red-500">
        Error loading sessions: {(countsError || oneToOneError || groupError)?.message}
      </p>
    );
  }

  if (totalActive === 0) {
    logger.info('No active sessions', { totalActive });
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
          To start a session, use the search box below to find a service user you want to engage.
        </p>
        <p className="text-base text-gray-500 dark:text-gray-400">
          <em>Then come back here once a session is started!</em>
        </p>
      </motion.div>
    );
  }

  logger.debug('Rendering ActiveSessionsDashboard', { oneToOneCount, groupCount, decliningSession });

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
            onClick={() => {
              logger.info('Opening end all one-to-one modal', { count: oneToOneCount });
              setShowEndAllOneToOneModal(true);
            }}
            className={`btn bg-red-500 hover:bg-red-600 text-white ${oneToOneCount === 0 ? 'btn-disabled' : ''}`}
            disabled={oneToOneCount === 0}
          >
            End All One-to-One ({oneToOneCount})
          </button>
          <button
            onClick={() => {
              logger.info('Opening end all group modal', { count: groupCount });
              setShowEndAllGroupModal(true);
            }}
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
          />
        ))}
        {sessionsToDisplay.map((session: any) => (
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
                <strong>Time In:</strong> {new Date(session.timeIn).toLocaleString()}
              </p>
              <div className="my-4">
                <ElapsedTime timeIn={session.timeIn} timeOut={session.timeOut} big />
              </div>
              <div className="card-actions justify-between space-x-2">
                {!session.timeOut && (
                  <>
                    <button
                      onClick={handleDeclineClick(session)}
                      className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleEndSessionClick(session.id, session.admission.serviceUser.name)}
                      className="btn bg-red-500 hover:bg-red-600 text-white"
                    >
                      End Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation for Ending All One-to-One Sessions */}
      <ConfirmationDialog
        isOpen={showEndAllOneToOneModal}
        onClose={() => setShowEndAllOneToOneModal(false)}
        onConfirm={() => endAllOneToOneMutation.mutate()}
        title="End All One-to-One Sessions"
        message={`Are you sure you want to end all ${oneToOneCount} active one-to-one sessions? This action cannot be undone.`}
        isPending={endAllOneToOneMutation.isPending}
        icon={
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Confirmation for Ending All Group Sessions */}
      <ConfirmationDialog
        isOpen={showEndAllGroupModal}
        onClose={() => setShowEndAllGroupModal(false)}
        onConfirm={() => endAllGroupMutation.mutate()}
        title="End All Group Sessions"
        message={`Are you sure you want to end all ${groupCount} active group sessions? This action cannot be undone.`}
        isPending={endAllGroupMutation.isPending}
        icon={
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Confirmation for Ending Individual One-to-One Session */}
      {endingSession && (
        <ConfirmationDialog
          isOpen={isEndSessionModalOpen}
          onClose={() => setIsEndSessionModalOpen(false)}
          onConfirm={() => endSessionMutation.mutate(endingSession.id)}
          title="End Session"
          message={`Are you sure you want to end the session for ${endingSession.serviceUserName}? This action cannot be undone.`}
          isPending={endSessionMutation.isPending}
          icon={
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      )}

      {/* DeclineSessionModal with Headless UI */}
      {decliningSession && (
        <Transition appear show={isDeclineModalOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCloseDeclineModal}>
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
                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
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
    </div>
  );
};

export default ActiveSessionsDashboard;
// src/features/Sessions/ui/ActiveSessionsDashboard.tsx
