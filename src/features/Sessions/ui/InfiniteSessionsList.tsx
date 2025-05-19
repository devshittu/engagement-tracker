// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.

'use client';

import React, { useState } from 'react';
import { InView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Session, SessionType, SessionStatus } from '@prisma/client';
import ElapsedTime from './ElapsedTime';
import GroupSessionCard from './cards/GroupSessionCard';
import { apiClient } from '@/lib/api-client';
import { EditSessionTimesModal } from './EditSessionTimesModal';
import { useSessions } from '@/hooks/useSessions';

interface SessionsResponse {
  sessions: (Session & {
    admission: { serviceUser: { name: string } };
    activityLog: { activity: { name: string }; id: number };
  })[];
  total: number;
  nextCursor: string | null;
}

interface GroupedSession {
  timeIn?: string;
  admissionId?: number;
  activityId?: number;
  _count: { _all: number };
}

interface GroupedResponse {
  groupedData: GroupedSession[];
  total: number;
  nextCursor: string | null;
}

type SessionsData = SessionsResponse | GroupedResponse;

const InfiniteSessionsList: React.FC = () => {
  const [sortBy, setSortBy] = useState<string>('timeIn');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<
    'none' | 'timeIn' | 'activityLogId' | 'admissionId'
  >('none');
  const [showFiltersDescription, setShowFiltersDescription] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useSessions({
      sortBy,
      order,
      groupBy,
    });

  const handleEndSession = async (sessionId: number) => {
    try {
      await apiClient.post(`/api/sessions/${sessionId}/end`, { id: sessionId });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session ended successfully!');
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast.error(error.response?.data?.error || 'Failed to end session');
    }
  };

  const handleEditSessionClick =
    (session: Session) => (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setEditingSession(session);
      setIsEditModalOpen(true);
    };

  const renderPage = (page: SessionsData, pageIndex: number) => {
    if ('groupedData' in page) {
      return (
        <React.Fragment key={pageIndex}>
          {page.groupedData.map((group: GroupedSession, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-2">
                {group.timeIn && (
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <span className="mr-2">⏳</span>Time In:{' '}
                    {new Date(group.timeIn).toLocaleString()}
                  </p>
                )}
                {group.admissionId && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="mr-2">🏥</span>Admission ID:{' '}
                    {group.admissionId}
                  </p>
                )}
                {group.activityId && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="mr-2">🎯</span>Activity Log ID:{' '}
                    {group.activityId}
                  </p>
                )}
                <p className="text-teal-600 dark:text-teal-400 font-bold">
                  <span className="mr-2">📌</span>Count: {group._count._all}
                </p>
              </div>
            </motion.div>
          ))}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment key={pageIndex}>
          {page.sessions
            .reduce(
              (
                acc: { groupRef: string; sessions: Session[] }[],
                session: Session,
              ) => {
                if (
                  session.type === SessionType.GROUP &&
                  session.groupRef &&
                  !session.timeOut
                ) {
                  const existingGroup = acc.find(
                    (group) => group.groupRef === session.groupRef,
                  );
                  if (existingGroup) {
                    existingGroup.sessions.push(session);
                  } else {
                    acc.push({
                      groupRef: session.groupRef,
                      sessions: [session],
                    });
                  }
                }
                return acc;
              },
              [],
            )
            .map((group) => (
              <GroupSessionCard
                key={group.groupRef}
                groupRef={group.groupRef}
                groupDescription={
                  group.sessions[0].groupDescription ||
                  'No description available'
                }
                sessions={group.sessions}
              />
            ))}
          {page.sessions
            .filter(
              (session) =>
                session.type === SessionType.ONE_TO_ONE || session.timeOut,
            )
            .map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      <span className="mr-2">🧑‍⚕️</span>
                      {session.admission.serviceUser.name}
                    </h2>
                    <span className="badge bg-teal-500 text-white px-2 py-1 rounded-full text-sm">
                      #{session.id}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="mr-2">🎯</span>Activity:{' '}
                    {session.activityLog.activity.name}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="mr-2">⏳</span>Time In:{' '}
                    {new Date(session.timeIn).toLocaleString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="mr-2">🚀</span>Time Out:{' '}
                    {session.timeOut ? (
                      new Date(session.timeOut).toLocaleString()
                    ) : (
                      <span className="badge bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                        In Progress
                      </span>
                    )}
                  </p>
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="mr-2">⏰</span>Elapsed Time:{' '}
                    <ElapsedTime
                      timeIn={session.timeIn}
                      timeOut={session.timeOut}
                      big
                    />
                  </div>
                  <div className="flex space-x-2">
                    {!session.timeOut &&
                      session.type === SessionType.ONE_TO_ONE && (
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="btn bg-red-500 hover:bg-red-600 text-white w-full rounded-lg py-2 transition-colors"
                        >
                          End Session
                        </button>
                      )}
                    {session.status === SessionStatus.COMPLETED && (
                      <button
                        onClick={handleEditSessionClick(session)}
                        className="btn bg-teal-500 hover:bg-teal-600 text-white w-full rounded-lg py-2 transition-colors"
                      >
                        Edit Times
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </React.Fragment>
      );
    }
  };

  return (
    <div className=" p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Filter Sessions
          </h2>
          <button
            onClick={() => setShowFiltersDescription(!showFiltersDescription)}
            className="text-teal-500 hover:text-teal-600 text-sm"
          >
            {showFiltersDescription ? 'Hide Info' : 'Show Info'}
          </button>
        </div>
        {showFiltersDescription && (
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            {`Use these filters to sort and group your sessions. "Sort By" orders
            the list, "Order" sets ascending or descending, and "Group By"
            organizes sessions into categories like time, activity, or
            admission.`}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label
              htmlFor="sortSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Sort By
            </label>
            <select
              id="sortSelect"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="timeIn">Time In</option>
              <option value="activityName">Activity Name</option>
              <option value="serviceUserName">Service User Name</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="orderSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Order
            </label>
            <select
              id="orderSelect"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="groupSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Group By
            </label>
            <select
              id="groupSelect"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              value={groupBy}
              onChange={(e) =>
                setGroupBy(
                  e.target.value as
                    | 'none'
                    | 'timeIn'
                    | 'activityLogId'
                    | 'admissionId',
                )
              }
            >
              <option value="none">None</option>
              <option value="timeIn">Time In</option>
              <option value="activityLogId">Activity Log</option>
              <option value="admissionId">Admission</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data?.pages.map((page: SessionsData, pageIndex: number) =>
            renderPage(page, pageIndex),
          )}
        </div>
        {hasNextPage && (
          <InView
            onChange={(inView) => {
              if (inView && !isFetchingNextPage) fetchNextPage();
            }}
          >
            {({ ref }) => (
              <div ref={ref} className="flex justify-center items-center py-6">
                {isFetchingNextPage ? (
                  <span className="loading loading-spinner text-teal-500 w-8 h-8"></span>
                ) : (
                  <button
                    className="btn border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white rounded-lg px-6 py-2 transition-colors"
                    onClick={() => fetchNextPage()}
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </InView>
        )}
        {!hasNextPage && !isFetching && (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <p>No more sessions to load.</p>
          </div>
        )}
      </div>
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

export default InfiniteSessionsList;
// src/features/Sessions/ui/InfiniteSessionsList.tsx
